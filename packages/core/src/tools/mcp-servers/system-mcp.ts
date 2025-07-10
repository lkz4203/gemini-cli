/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequest, ListToolsRequest, ListToolsResponse } from '@modelcontextprotocol/sdk/types.js';
import { SystemMCPTool } from './system-mcp-tool.js';

export class SystemMCPServer {
  private server: Server;
  private systemTool: SystemMCPTool;

  constructor() {
    this.systemTool = new SystemMCPTool();
    
    this.server = new Server(
      {
        name: 'system-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequest, async () => {
      return {
        tools: [
          {
            name: 'get_process_info',
            description: 'Zeigt Informationen über laufende Prozesse an',
            inputSchema: {
              type: 'object',
              properties: {
                process_name: {
                  type: 'string',
                  description: 'Name des Prozesses (optional)',
                },
                limit: {
                  type: 'number',
                  description: 'Maximale Anzahl der Ergebnisse',
                  default: 20,
                },
              },
            },
          },
          {
            name: 'get_system_info',
            description: 'Zeigt System-Informationen an',
            inputSchema: {
              type: 'object',
              properties: {
                include_detailed: {
                  type: 'boolean',
                  description: 'Detaillierte Informationen einschließen',
                  default: false,
                },
              },
            },
          },
          {
            name: 'get_disk_usage',
            description: 'Zeigt Festplatten-Nutzung an',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Pfad zum Überprüfen (optional)',
                  default: '/',
                },
              },
            },
          },
          {
            name: 'get_memory_usage',
            description: 'Zeigt Speicher-Nutzung an',
            inputSchema: {
              type: 'object',
              properties: {
                format: {
                  type: 'string',
                  enum: ['bytes', 'mb', 'gb'],
                  description: 'Ausgabeformat',
                  default: 'mb',
                },
              },
            },
          },
          {
            name: 'kill_process',
            description: 'Beendet einen Prozess',
            inputSchema: {
              type: 'object',
              properties: {
                pid: {
                  type: 'number',
                  description: 'Prozess-ID',
                },
                signal: {
                  type: 'string',
                  description: 'Signal zum Senden (SIGTERM, SIGKILL, etc.)',
                  default: 'SIGTERM',
                },
              },
              required: ['pid'],
            },
          },
          {
            name: 'get_network_connections',
            description: 'Zeigt aktive Netzwerk-Verbindungen an',
            inputSchema: {
              type: 'object',
              properties: {
                protocol: {
                  type: 'string',
                  enum: ['tcp', 'udp', 'all'],
                  description: 'Protokoll-Filter',
                  default: 'all',
                },
                state: {
                  type: 'string',
                  enum: ['LISTEN', 'ESTABLISHED', 'all'],
                  description: 'Verbindungsstatus-Filter',
                  default: 'all',
                },
              },
            },
          },
        ],
      } as ListToolsResponse;
    });

    this.server.setRequestHandler(CallToolRequest, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        let result: any;

        switch (name) {
          case 'get_process_info':
            result = await this.systemTool.getProcessInfo(
              args.process_name,
              args.limit,
            );
            break;
          case 'get_system_info':
            result = await this.systemTool.getSystemInfo(
              args.include_detailed,
            );
            break;
          case 'get_disk_usage':
            result = await this.systemTool.getDiskUsage(
              args.path,
            );
            break;
          case 'get_memory_usage':
            result = await this.systemTool.getMemoryUsage(
              args.format,
            );
            break;
          case 'kill_process':
            result = await this.systemTool.killProcess(
              args.pid,
              args.signal,
            );
            break;
          case 'get_network_connections':
            result = await this.systemTool.getNetworkConnections(
              args.protocol,
              args.state,
            );
            break;
          default:
            throw new Error(`Unbekanntes Tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Fehler: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new SystemMCPServer();
  server.start().catch(console.error);
}