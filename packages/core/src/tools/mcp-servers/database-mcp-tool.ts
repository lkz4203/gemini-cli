/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Database } from 'sqlite3';
import { Client as PostgresClient } from 'pg';
import { createConnection, Connection } from 'mysql2/promise';

export class DatabaseMCPTool {
  async executeQuery(
    databaseType: string,
    connectionString: string,
    query: string,
  ): Promise<any> {
    try {
      switch (databaseType.toLowerCase()) {
        case 'sqlite':
          return await this.executeSQLiteQuery(connectionString, query);
        case 'postgresql':
          return await this.executePostgreSQLQuery(connectionString, query);
        case 'mysql':
          return await this.executeMySQLQuery(connectionString, query);
        default:
          throw new Error(`Nicht unterstützter Datenbanktyp: ${databaseType}`);
      }
    } catch (error) {
      throw new Error(`Datenbankfehler: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async listTables(
    databaseType: string,
    connectionString: string,
  ): Promise<string[]> {
    try {
      switch (databaseType.toLowerCase()) {
        case 'sqlite':
          return await this.listSQLiteTables(connectionString);
        case 'postgresql':
          return await this.listPostgreSQLTables(connectionString);
        case 'mysql':
          return await this.listMySQLTables(connectionString);
        default:
          throw new Error(`Nicht unterstützter Datenbanktyp: ${databaseType}`);
      }
    } catch (error) {
      throw new Error(`Fehler beim Auflisten der Tabellen: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async describeTable(
    databaseType: string,
    connectionString: string,
    tableName: string,
  ): Promise<any> {
    try {
      switch (databaseType.toLowerCase()) {
        case 'sqlite':
          return await this.describeSQLiteTable(connectionString, tableName);
        case 'postgresql':
          return await this.describePostgreSQLTable(connectionString, tableName);
        case 'mysql':
          return await this.describeMySQLTable(connectionString, tableName);
        default:
          throw new Error(`Nicht unterstützter Datenbanktyp: ${databaseType}`);
      }
    } catch (error) {
      throw new Error(`Fehler beim Beschreiben der Tabelle: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async executeSQLiteQuery(connectionString: string, query: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const db = new Database(connectionString);
      db.all(query, (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  private async executePostgreSQLQuery(connectionString: string, query: string): Promise<any> {
    const client = new PostgresClient({ connectionString });
    try {
      await client.connect();
      const result = await client.query(query);
      return result.rows;
    } finally {
      await client.end();
    }
  }

  private async executeMySQLQuery(connectionString: string, query: string): Promise<any> {
    const connection: Connection = await createConnection(connectionString);
    try {
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      await connection.end();
    }
  }

  private async listSQLiteTables(connectionString: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const db = new Database(connectionString);
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(rows.map((row: any) => row.name));
        }
      });
    });
  }

  private async listPostgreSQLTables(connectionString: string): Promise<string[]> {
    const client = new PostgresClient({ connectionString });
    try {
      await client.connect();
      const result = await client.query(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
      );
      return result.rows.map((row: any) => row.tablename);
    } finally {
      await client.end();
    }
  }

  private async listMySQLTables(connectionString: string): Promise<string[]> {
    const connection: Connection = await createConnection(connectionString);
    try {
      const [rows] = await connection.execute("SHOW TABLES");
      return (rows as any[]).map((row: any) => Object.values(row)[0] as string);
    } finally {
      await connection.end();
    }
  }

  private async describeSQLiteTable(connectionString: string, tableName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const db = new Database(connectionString);
      db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
        db.close();
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  private async describePostgreSQLTable(connectionString: string, tableName: string): Promise<any> {
    const client = new PostgresClient({ connectionString });
    try {
      await client.connect();
      const result = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      return result.rows;
    } finally {
      await client.end();
    }
  }

  private async describeMySQLTable(connectionString: string, tableName: string): Promise<any> {
    const connection: Connection = await createConnection(connectionString);
    try {
      const [rows] = await connection.execute(`DESCRIBE ${tableName}`);
      return rows;
    } finally {
      await connection.end();
    }
  }
}