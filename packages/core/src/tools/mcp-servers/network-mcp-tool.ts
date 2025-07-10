/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import dns from 'dns';
import { lookup } from 'dns/promises';
import { get } from 'http';
import { get as httpsGet } from 'https';
import { URL } from 'url';

const execAsync = promisify(exec);

export class NetworkMCPTool {
  async portScan(host: string, ports: string, timeout: number = 5000): Promise<any> {
    try {
      const portList = this.parsePorts(ports);
      const results: any[] = [];

      for (const port of portList) {
        try {
          const isOpen = await this.checkPort(host, port, timeout);
          results.push({
            port,
            status: isOpen ? 'open' : 'closed',
            host,
          });
        } catch (error) {
          results.push({
            port,
            status: 'error',
            error: error instanceof Error ? error.message : String(error),
            host,
          });
        }
      }

      return {
        host,
        scan_results: results,
        total_ports: portList.length,
        open_ports: results.filter(r => r.status === 'open').map(r => r.port),
      };
    } catch (error) {
      throw new Error(`Port-Scan Fehler: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async dnsLookup(domain: string, recordType: string = 'A'): Promise<any> {
    try {
      const records = await lookup(domain, { all: true });
      
      return {
        domain,
        record_type: recordType,
        records: records.map(record => ({
          address: record.address,
          family: record.family,
        })),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`DNS-Lookup Fehler: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async httpTest(
    url: string,
    method: string = 'GET',
    headers: Record<string, string> = {},
    timeout: number = 10000,
  ): Promise<any> {
    try {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? httpsGet : get;

      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('HTTP-Request Timeout'));
        }, timeout);

        const req = client(url, { method, headers }, (res) => {
          clearTimeout(timeoutId);
          
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            resolve({
              url,
              method,
              status_code: res.statusCode,
              status_message: res.statusMessage,
              headers: res.headers,
              response_size: data.length,
              response_preview: data.substring(0, 500),
              timestamp: new Date().toISOString(),
            });
          });
        });

        req.on('error', (error) => {
          clearTimeout(timeoutId);
          reject(error);
        });

        req.end();
      });
    } catch (error) {
      throw new Error(`HTTP-Test Fehler: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async pingHost(host: string, count: number = 4): Promise<any> {
    try {
      const { stdout } = await execAsync(`ping -c ${count} ${host}`);
      
      const lines = stdout.split('\n');
      const pingStats = lines.find(line => line.includes('packets transmitted'));
      
      return {
        host,
        ping_output: stdout,
        stats: pingStats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Ping Fehler: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private parsePorts(ports: string): number[] {
    const portList: number[] = [];
    
    if (ports.includes('-')) {
      // Range format: "1-1000"
      const [start, end] = ports.split('-').map(p => parseInt(p.trim()));
      for (let i = start; i <= end; i++) {
        portList.push(i);
      }
    } else if (ports.includes(',')) {
      // List format: "80,443,8080"
      portList.push(...ports.split(',').map(p => parseInt(p.trim())));
    } else {
      // Single port
      portList.push(parseInt(ports.trim()));
    }
    
    return portList;
  }

  private async checkPort(host: string, port: number, timeout: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = require('net').connect(port, host, () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.setTimeout(timeout, () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });
    });
  }
}