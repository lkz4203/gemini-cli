/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { platform, arch, cpus, totalmem, freemem } from 'os';
import { statfs } from 'fs/promises';

const execAsync = promisify(exec);

export class SystemMCPTool {
  async getProcessInfo(processName?: string, limit: number = 20): Promise<any> {
    try {
      let command = 'ps aux';
      if (processName) {
        command += ` | grep ${processName}`;
      }
      command += ` | head -${limit}`;

      const { stdout } = await execAsync(command);
      const lines = stdout.trim().split('\n');
      
      const processes = lines
        .filter(line => line.trim() && !line.includes('grep'))
        .map(line => {
          const parts = line.split(/\s+/);
          return {
            user: parts[0],
            pid: parseInt(parts[1]),
            cpu: parseFloat(parts[2]),
            mem: parseFloat(parts[3]),
            vsz: parseInt(parts[4]),
            rss: parseInt(parts[5]),
            tty: parts[6],
            stat: parts[7],
            start: parts[8],
            time: parts[9],
            command: parts.slice(10).join(' '),
          };
        });

      return {
        processes,
        total_count: processes.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Prozess-Info Fehler: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getSystemInfo(includeDetailed: boolean = false): Promise<any> {
    try {
      const basicInfo = {
        platform: platform(),
        architecture: arch(),
        cpu_count: cpus().length,
        cpu_model: cpus()[0]?.model || 'Unknown',
        total_memory: totalmem(),
        free_memory: freemem(),
        memory_usage_percent: ((totalmem() - freemem()) / totalmem() * 100).toFixed(2),
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      };

      if (includeDetailed) {
        const { stdout: hostname } = await execAsync('hostname');
        const { stdout: kernel } = await execAsync('uname -r');
        const { stdout: loadavg } = await execAsync('cat /proc/loadavg');
        
        return {
          ...basicInfo,
          hostname: hostname.trim(),
          kernel: kernel.trim(),
          load_average: loadavg.trim(),
          cpu_details: cpus().map(cpu => ({
            model: cpu.model,
            speed: cpu.speed,
            times: cpu.times,
          })),
        };
      }

      return basicInfo;
    } catch (error) {
      throw new Error(`System-Info Fehler: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getDiskUsage(path: string = '/'): Promise<any> {
    try {
      const { stdout } = await execAsync(`df -h ${path}`);
      const lines = stdout.trim().split('\n');
      
      const diskInfo = lines.slice(1).map(line => {
        const parts = line.split(/\s+/);
        return {
          filesystem: parts[0],
          size: parts[1],
          used: parts[2],
          available: parts[3],
          use_percent: parts[4],
          mounted_on: parts[5],
        };
      });

      return {
        path,
        disk_info: diskInfo,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Disk-Usage Fehler: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getMemoryUsage(format: string = 'mb'): Promise<any> {
    try {
      const total = totalmem();
      const free = freemem();
      const used = total - free;
      const usagePercent = (used / total * 100).toFixed(2);

      let totalFormatted: string;
      let usedFormatted: string;
      let freeFormatted: string;

      switch (format.toLowerCase()) {
        case 'bytes':
          totalFormatted = total.toString();
          usedFormatted = used.toString();
          freeFormatted = free.toString();
          break;
        case 'gb':
          totalFormatted = (total / 1024 / 1024 / 1024).toFixed(2) + ' GB';
          usedFormatted = (used / 1024 / 1024 / 1024).toFixed(2) + ' GB';
          freeFormatted = (free / 1024 / 1024 / 1024).toFixed(2) + ' GB';
          break;
        default: // mb
          totalFormatted = (total / 1024 / 1024).toFixed(2) + ' MB';
          usedFormatted = (used / 1024 / 1024).toFixed(2) + ' MB';
          freeFormatted = (free / 1024 / 1024).toFixed(2) + ' MB';
      }

      return {
        total: totalFormatted,
        used: usedFormatted,
        free: freeFormatted,
        usage_percent: usagePercent,
        format,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Memory-Usage Fehler: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async killProcess(pid: number, signal: string = 'SIGTERM'): Promise<any> {
    try {
      await execAsync(`kill -${signal} ${pid}`);
      
      return {
        pid,
        signal,
        status: 'success',
        message: `Prozess ${pid} wurde mit Signal ${signal} beendet`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Kill-Process Fehler: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getNetworkConnections(protocol: string = 'all', state: string = 'all'): Promise<any> {
    try {
      let command = 'netstat -tuln';
      
      if (protocol !== 'all') {
        command += ` | grep ${protocol}`;
      }
      
      if (state !== 'all') {
        command += ` | grep ${state}`;
      }

      const { stdout } = await execAsync(command);
      const lines = stdout.trim().split('\n');
      
      const connections = lines
        .filter(line => line.trim() && !line.includes('Proto'))
        .map(line => {
          const parts = line.split(/\s+/);
          return {
            proto: parts[0],
            recv_q: parseInt(parts[1]),
            send_q: parseInt(parts[2]),
            local_address: parts[3],
            foreign_address: parts[4],
            state: parts[5] || 'N/A',
          };
        });

      return {
        protocol_filter: protocol,
        state_filter: state,
        connections,
        total_count: connections.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Network-Connections Fehler: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}