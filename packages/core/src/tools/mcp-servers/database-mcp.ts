/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequest, ListToolsRequest, ListToolsResponse } from '@modelcontextprotocol/sdk/types.js';
import { DatabaseMCPTool } from './database-mcp-tool.js';

export class DatabaseMCPServer {
  private server: Server;
  private databaseTool: DatabaseMCPTool;

  constructor() {
    this.databaseTool = new DatabaseMCPTool();
    
    this.server = new Server(
      {
        name: 'database-mcp-server',
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
            name: 'execute_sql_query',
            description: 'Führt eine SQL-Abfrage auf einer Datenbank aus',
            inputSchema: {
              type: 'object',
              properties: {
                connection_string: {
                  type: 'string',
                  description: 'Datenbankverbindungsstring (SQLite, PostgreSQL, MySQL)',
                },
                query: {
                  type: 'string',
                  description: 'SQL-Abfrage die ausgeführt werden soll',
                },
                database_type: {
                  type: 'string',
                  enum: ['sqlite', 'postgresql', 'mysql'],
                  description: 'Typ der Datenbank',
                },
              },
              required: ['connection_string', 'query', 'database_type'],
            },
          },
          {
            name: 'list_tables',
            description: 'Listet alle Tabellen in einer Datenbank auf',
            inputSchema: {
              type: 'object',
              properties: {
                connection_string: {
                  type: 'string',
                  description: 'Datenbankverbindungsstring',
                },
                database_type: {
                  type: 'string',
                  enum: ['sqlite', 'postgresql', 'mysql'],
                  description: 'Typ der Datenbank',
                },
              },
              required: ['connection_string', 'database_type'],
            },
          },
          {
            name: 'describe_table',
            description: 'Zeigt die Struktur einer Tabelle an',
            inputSchema: {
              type: 'object',
              properties: {
                connection_string: {
                  type: 'string',
                  description: 'Datenbankverbindungsstring',
                },
                table_name: {
                  type: 'string',
                  description: 'Name der Tabelle',
                },
                database_type: {
                  type: 'string',
                  enum: ['sqlite', 'postgresql', 'mysql'],
                  description: 'Typ der Datenbank',
                },
              },
              required: ['connection_string', 'table_name', 'database_type'],
            },
          },
        ],
      } as ListToolsResponse;
    });

    this.server.setRequestHandler(CallToolRequest, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result: any;

        switch (name) {
          case 'execute_sql_query':
            result = await this.databaseTool.executeQuery(
              args.database_type,
              args.connection_string,
              args.query,
            );
            break;
          case 'list_tables':
            result = await this.databaseTool.listTables(
              args.database_type,
              args.connection_string,
            );
            break;
          case 'describe_table':
            result = await this.databaseTool.describeTable(
              args.database_type,
              args.connection_string,
              args.table_name,
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
  const server = new DatabaseMCPServer();
  server.start().catch(console.error);
}