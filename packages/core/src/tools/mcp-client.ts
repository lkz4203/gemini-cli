/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import {
  StreamableHTTPClientTransport,
  StreamableHTTPClientTransportOptions,
} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { parse } from 'shell-quote';
import { MCPServerConfig } from '../config/config.js';
import { DiscoveredMCPTool } from './mcp-tool.js';
import {
  CallableTool,
  FunctionDeclaration,
  mcpToTool,
  Schema,
} from '@google/genai';
import { ToolRegistry } from './tool-registry.js';

export const MCP_DEFAULT_TIMEOUT_MSEC = 10 * 60 * 1000; // default to 10 minutes

/**
 * Enum representing the connection status of an MCP server
 */
export enum MCPServerStatus {
  /** Server is disconnected or experiencing errors */
  DISCONNECTED = 'disconnected',
  /** Server is in the process of connecting */
  CONNECTING = 'connecting',
  /** Server is connected and ready to use */
  CONNECTED = 'connected',
}

/**
 * Enum representing the overall MCP discovery state
 */
export enum MCPDiscoveryState {
  /** Discovery has not started yet */
  NOT_STARTED = 'not_started',
  /** Discovery is currently in progress */
  IN_PROGRESS = 'in_progress',
  /** Discovery has completed (with or without errors) */
  COMPLETED = 'completed',
}

/**
 * Map to track the status of each MCP server within the core package
 */
const mcpServerStatusesInternal: Map<string, MCPServerStatus> = new Map();

/**
 * Track the overall MCP discovery state
 */
let mcpDiscoveryState: MCPDiscoveryState = MCPDiscoveryState.NOT_STARTED;

/**
 * Event listeners for MCP server status changes
 */
type StatusChangeListener = (
  serverName: string,
  status: MCPServerStatus,
) => void;
const statusChangeListeners: StatusChangeListener[] = [];

/**
 * Add a listener for MCP server status changes
 */
export function addMCPStatusChangeListener(
  listener: StatusChangeListener,
): void {
  statusChangeListeners.push(listener);
}

/**
 * Remove a listener for MCP server status changes
 */
export function removeMCPStatusChangeListener(
  listener: StatusChangeListener,
): void {
  const index = statusChangeListeners.indexOf(listener);
  if (index !== -1) {
    statusChangeListeners.splice(index, 1);
  }
}

/**
 * Update the status of an MCP server
 */
function updateMCPServerStatus(
  serverName: string,
  status: MCPServerStatus,
): void {
  mcpServerStatusesInternal.set(serverName, status);
  // Notify all listeners
  for (const listener of statusChangeListeners) {
    listener(serverName, status);
  }
}

/**
 * Get the current status of an MCP server
 */
export function getMCPServerStatus(serverName: string): MCPServerStatus {
  return (
    mcpServerStatusesInternal.get(serverName) || MCPServerStatus.DISCONNECTED
  );
}

/**
 * Get all MCP server statuses
 */
export function getAllMCPServerStatuses(): Map<string, MCPServerStatus> {
  return new Map(mcpServerStatusesInternal);
}

/**
 * Get the current MCP discovery state
 */
export function getMCPDiscoveryState(): MCPDiscoveryState {
  return mcpDiscoveryState;
}

export async function discoverMcpTools(
  mcpServers: Record<string, MCPServerConfig>,
  mcpServerCommand: string | undefined,
  toolRegistry: ToolRegistry,
): Promise<void> {
  // Set discovery state to in progress
  mcpDiscoveryState = MCPDiscoveryState.IN_PROGRESS;

  try {
    if (mcpServerCommand) {
      const cmd = mcpServerCommand;
      const args = parse(cmd, process.env) as string[];
      if (args.some((arg) => typeof arg !== 'string')) {
        throw new Error('failed to parse mcpServerCommand: ' + cmd);
      }
      // use generic server name 'mcp'
      mcpServers['mcp'] = {
        command: args[0],
        args: args.slice(1),
      };
    }

    const discoveryPromises = Object.entries(mcpServers).map(
      ([mcpServerName, mcpServerConfig]) =>
        connectAndDiscover(mcpServerName, mcpServerConfig, toolRegistry),
    );
    await Promise.all(discoveryPromises);

    // Mark discovery as completed
    mcpDiscoveryState = MCPDiscoveryState.COMPLETED;
  } catch (error) {
    // Still mark as completed even with errors
    mcpDiscoveryState = MCPDiscoveryState.COMPLETED;
    throw error;
  }
}

async function connectAndDiscover(
  mcpServerName: string,
  mcpServerConfig: MCPServerConfig,
  toolRegistry: ToolRegistry,
): Promise<void> {
  // Initialize the server status as connecting
  updateMCPServerStatus(mcpServerName, MCPServerStatus.CONNECTING);

  let transport;
  if (mcpServerConfig.httpUrl) {
    const transportOptions: StreamableHTTPClientTransportOptions = {};

    if (mcpServerConfig.headers) {
      transportOptions.requestInit = {
        headers: mcpServerConfig.headers,
      };
    }

    transport = new StreamableHTTPClientTransport(
      new URL(mcpServerConfig.httpUrl),
      transportOptions,
    );
  } else if (mcpServerConfig.url) {
    transport = new SSEClientTransport(new URL(mcpServerConfig.url));
  } else if (mcpServerConfig.command) {
    // Erweitere die Umgebungsvariablen für MCP-Server
    const env = {
      ...process.env,
      ...(mcpServerConfig.env || {}),
      NODE_PATH: process.env.NODE_PATH || '',
      PATH: process.env.PATH || '',
    } as Record<string, string>;

    transport = new StdioClientTransport({
      command: mcpServerConfig.command,
      args: mcpServerConfig.args || [],
      env,
      cwd: mcpServerConfig.cwd || process.cwd(),
      stderr: 'pipe',
    });
  } else {
    throw new Error(
      `Ungültige MCP-Server-Konfiguration für ${mcpServerName}: mindestens command, url oder httpUrl muss angegeben werden`,
    );
  }

  try {
    const client = new Client(
      {
        name: mcpServerName,
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    await client.connect(transport);

    // Update status to connected
    updateMCPServerStatus(mcpServerName, MCPServerStatus.CONNECTED);

    const tools = await client.listTools();
    const discoveredTools: DiscoveredMCPTool[] = [];

    for (const tool of tools.tools) {
      const mcpTool = mcpToTool(client, tool);
      const discoveredTool = new DiscoveredMCPTool(
        mcpTool,
        mcpServerName,
        tool.name,
        tool.description || '',
        tool.inputSchema || {},
        tool.name,
        mcpServerConfig.timeout || MCP_DEFAULT_TIMEOUT_MSEC,
        mcpServerConfig.trust || false,
      );
      discoveredTools.push(discoveredTool);
    }

    // Register all discovered tools
    for (const tool of discoveredTools) {
      toolRegistry.registerTool(tool);
    }

    // Log successful discovery
    console.log(
      `✅ MCP-Server "${mcpServerName}" erfolgreich verbunden. ${discoveredTools.length} Tools entdeckt.`,
    );
  } catch (error) {
    // Update status to disconnected on error
    updateMCPServerStatus(mcpServerName, MCPServerStatus.DISCONNECTED);
    
    console.error(
      `❌ Fehler beim Verbinden mit MCP-Server "${mcpServerName}": ${error instanceof Error ? error.message : String(error)}`,
    );
    throw error;
  }
}

export function sanitizeParameters(schema?: Schema) {
  if (!schema) {
    return;
  }
  if (schema.anyOf) {
    // Vertex AI gets confused if both anyOf and default are set.
    schema.default = undefined;
    for (const item of schema.anyOf) {
      sanitizeParameters(item);
    }
  }
  if (schema.items) {
    sanitizeParameters(schema.items);
  }
  if (schema.properties) {
    for (const item of Object.values(schema.properties)) {
      sanitizeParameters(item);
    }
  }
}
