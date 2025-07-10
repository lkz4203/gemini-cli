/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text } from 'ink';
import v8 from 'node:v8';
import os from 'node:os';

interface PerformanceMetrics {
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  heapStats: v8.HeapSpaceInfo[];
  systemMemory: {
    total: number;
    free: number;
    used: number;
  };
  uptime: number;
  processUptime: number;
}

interface PerformanceMonitorProps {
  isVisible: boolean;
  onClose: () => void;
  refreshInterval?: number;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isVisible,
  onClose: _onClose,
  refreshInterval = 2000,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [startTime] = useState(Date.now());

  const collectMetrics = useCallback((): PerformanceMetrics => {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const heapStats = v8.getHeapSpaceStatistics();
    const systemMemory = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
    };

    return {
      memoryUsage,
      cpuUsage,
      heapStats,
      systemMemory,
      uptime: Date.now() - startTime,
      processUptime: process.uptime(),
    };
  }, [startTime]);

  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = () => {
      setMetrics(collectMetrics());
    };

    // Initial update
    updateMetrics();

    // Set up interval
    const interval = setInterval(updateMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [isVisible, refreshInterval, collectMetrics]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number, total: number): string => ((value / total) * 100).toFixed(1) + '%';

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  if (!isVisible || !metrics) return null;

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="magenta" padding={1}>
      <Box flexDirection="column" marginBottom={1}>
        <Text color="magenta" bold>Performance Monitor</Text>
        <Text color="gray" dimColor>
          Uptime: {formatDuration(metrics.uptime)} | Process: {formatDuration(metrics.processUptime * 1000)}
        </Text>
      </Box>

      <Box flexDirection="row">
        {/* Process Memory */}
        <Box flexDirection="column" width={30} borderStyle="single" borderColor="gray" marginRight={1}>
          <Text color="white" bold>Process Memory</Text>
          <Text color="gray" dimColor>
            RSS: {formatBytes(metrics.memoryUsage.rss)}
          </Text>
          <Text color="gray" dimColor>
            Heap Used: {formatBytes(metrics.memoryUsage.heapUsed)}
          </Text>
          <Text color="gray" dimColor>
            Heap Total: {formatBytes(metrics.memoryUsage.heapTotal)}
          </Text>
          <Text color="gray" dimColor>
            External: {formatBytes(metrics.memoryUsage.external)}
          </Text>
          <Text color="gray" dimColor>
            Array Buffers: {formatBytes(metrics.memoryUsage.arrayBuffers)}
          </Text>
        </Box>

        {/* System Memory */}
        <Box flexDirection="column" width={30} borderStyle="single" borderColor="gray" marginRight={1}>
          <Text color="white" bold>System Memory</Text>
          <Text color="gray" dimColor>
            Total: {formatBytes(metrics.systemMemory.total)}
          </Text>
          <Text color="gray" dimColor>
            Used: {formatBytes(metrics.systemMemory.used)} ({formatPercentage(metrics.systemMemory.used, metrics.systemMemory.total)})
          </Text>
          <Text color="gray" dimColor>
            Free: {formatBytes(metrics.systemMemory.free)} ({formatPercentage(metrics.systemMemory.free, metrics.systemMemory.total)})
          </Text>
        </Box>

        {/* Heap Spaces */}
        <Box flexDirection="column" flexGrow={1} borderStyle="single" borderColor="gray">
          <Text color="white" bold>Heap Spaces</Text>
          {metrics.heapStats.slice(0, 5).map((space, index) => (
            <Text key={index} color="gray" dimColor>
              {space.space_name}: {formatBytes(space.space_used_size)} / {formatBytes(space.space_size)}
            </Text>
          ))}
        </Box>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text color="gray" dimColor>
          Auto-refresh every {refreshInterval / 1000}s | Press any key to close
        </Text>
      </Box>
    </Box>
  );
};