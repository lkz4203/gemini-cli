/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequest, ListToolsRequest, ListToolsResponse } from '@modelcontextprotocol/sdk/types.js';
import { NetworkMCPTool } from './network-mcp-tool.js';

export class NetworkMCPServer {
  private server: Server;
  private networkTool: NetworkMCPTool;

  constructor() {
    this.networkTool = new NetworkMCPTool();
    
    this.server = new Server(
      {
        name: 'network-mcp-server',
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
            name: 'port_scan',
            description: 'Führt einen Port-Scan auf einem Host durch',
            inputSchema: {
              type: 'object',
              properties: {
                host: {
                  type: 'string',
                  description: 'Hostname oder IP-Adresse',
                },
                ports: {
                  type: 'string',
                  description: 'Ports zum Scannen (z.B. "80,443,8080" oder "1-1000")',
                },
                timeout: {
                  type: 'number',
                  description: 'Timeout in Millisekunden',
                  default: 5000,
                },
              },
              required: ['host', 'ports'],
            },
          },
          {
            name: 'dns_lookup',
            description: 'Führt DNS-Lookups durch',
            inputSchema: {
              type: 'object',
              properties: {
                domain: {
                  type: 'string',
                  description: 'Domain für DNS-Lookup',
                },
                record_type: {
                  type: 'string',
                  enum: ['A', 'AAAA', 'MX', 'CNAME', 'TXT', 'NS'],
                  description: 'DNS-Record-Typ',
                  default: 'A',
                },
              },
              required: ['domain'],
            },
          },
          {
            name: 'http_test',
            description: 'Testet HTTP-Endpunkte',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'URL zum Testen',
                },
                method: {
                  type: 'string',
                  enum: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
                  description: 'HTTP-Methode',
                  default: 'GET',
                },
                headers: {
                  type: 'object',
                  description: 'HTTP-Headers',
                },
                timeout: {
                  type: 'number',
                  description: 'Timeout in Millisekunden',
                  default: 10000,
                },
              },
              required: ['url'],
            },
          },
          {
            name: 'ping_host',
            description: 'Pingt einen Host an',
            inputSchema: {
              type: 'object',
              properties: {
                host: {
                  type: 'string',
                  description: 'Hostname oder IP-Adresse',
                },
                count: {
                  type: 'number',
                  description: 'Anzahl der Ping-Versuche',
                  default: 4,
                },
              },
              required: ['host'],
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
          case 'port_scan':
            result = await this.networkTool.portScan(
              args.host,
              args.ports,
              args.timeout,
            );
            break;
          case 'dns_lookup':
            result = await this.networkTool.dnsLookup(
              args.domain,
              args.record_type,
            );
            break;
          case 'http_test':
            result = await this.networkTool.httpTest(
              args.url,
              args.method,
              args.headers,
              args.timeout,
            );
            break;
          case 'ping_host':
            result = await this.networkTool.pingHost(
              args.host,
              args.count,
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
  const server = new NetworkMCPServer();
  server.start().catch(console.error);
}