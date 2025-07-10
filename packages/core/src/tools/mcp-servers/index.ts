/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export { DatabaseMCPServer } from './database-mcp.js';
export { NetworkMCPServer } from './network-mcp.js';
export { SystemMCPServer } from './system-mcp.js';

// MCP Server Konfigurationen
export const MCP_SERVER_CONFIGS = {
  database: {
    command: 'node',
    args: ['packages/core/src/tools/mcp-servers/database-mcp.js'],
    description: 'Datenbankoperationen (SQLite, PostgreSQL, MySQL)',
    trust: true,
  },
  network: {
    command: 'node',
    args: ['packages/core/src/tools/mcp-servers/network-mcp.js'],
    description: 'Netzwerkoperationen (Port-Scan, DNS, HTTP-Tests)',
    trust: true,
  },
  system: {
    command: 'node',
    args: ['packages/core/src/tools/mcp-servers/system-mcp.js'],
    description: 'Systemoperationen (Prozesse, System-Info, Disk-Usage)',
    trust: true,
  },
};

// Standard MCP Server Setup
export function getDefaultMCPServers() {
  return MCP_SERVER_CONFIGS;
}

// MCP Server Validierung
export function validateMCPServerConfig(config: any): boolean {
  return config && 
         typeof config.command === 'string' && 
         Array.isArray(config.args) &&
         config.args.every((arg: any) => typeof arg === 'string');
}