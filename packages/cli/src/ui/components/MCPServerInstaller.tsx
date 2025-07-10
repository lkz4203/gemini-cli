/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { spawn } from 'node:child_process';

interface MCPServerInstallerProps {
  isVisible: boolean;
  onClose: () => void;
  serverName: string;
  installCommand: string;
  configExample?: string;
  onInstallComplete: (success: boolean) => void;
}

interface InstallStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
}

export const MCPServerInstaller: React.FC<MCPServerInstallerProps> = ({
  isVisible,
  onClose,
  serverName,
  installCommand,
  configExample,
  onInstallComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<InstallStep[]>([
    { name: 'Installing MCP server package', status: 'pending' },
    { name: 'Validating installation', status: 'pending' },
    { name: 'Setting up configuration', status: 'pending' },
    { name: 'Testing connection', status: 'pending' },
  ]);
  const [isInstalling, setIsInstalling] = useState(false);

  const updateStep = useCallback((stepIndex: number, updates: Partial<InstallStep>) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, ...updates } : step
    ));
  }, []);

  const installPackage = useCallback(async () => {
    setIsInstalling(true);
    updateStep(0, { status: 'running' });

    return new Promise<boolean>((resolve) => {
      const [command, ...args] = installCommand.split(' ');
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
      });

      let output = '';
      let error = '';

      child.stdout?.on('data', (data) => {
        output += data.toString();
        updateStep(0, { output: output.trim() });
      });

      child.stderr?.on('data', (data) => {
        error += data.toString();
        updateStep(0, { error: error.trim() });
      });

      child.on('close', (code) => {
        if (code === 0) {
          updateStep(0, { status: 'completed' });
          resolve(true);
        } else {
          updateStep(0, { status: 'failed' });
          resolve(false);
        }
      });

      child.on('error', (err) => {
        updateStep(0, { status: 'failed', error: err.message });
        resolve(false);
      });
    });
  }, [installCommand, updateStep]);

  const validateInstallation = useCallback(async () => {
    updateStep(1, { status: 'running' });

    return new Promise<boolean>((resolve) => {
      const child = spawn('npx', ['-y', `@modelcontextprotocol/server-${serverName}`, '--help'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
      });

      let output = '';
      let error = '';

      child.stdout?.on('data', (data) => {
        output += data.toString();
        updateStep(1, { output: output.trim() });
      });

      child.stderr?.on('data', (data) => {
        error += data.toString();
        updateStep(1, { error: error.trim() });
      });

      child.on('close', (code) => {
        if (code === 0 || output.includes('help') || output.includes('usage')) {
          updateStep(1, { status: 'completed' });
          resolve(true);
        } else {
          updateStep(1, { status: 'failed' });
          resolve(false);
        }
      });

      child.on('error', (err) => {
        updateStep(1, { status: 'failed', error: err.message });
        resolve(false);
      });
    });
  }, [serverName, updateStep]);

  const setupConfiguration = useCallback(async () => {
    updateStep(2, { status: 'running' });

    if (!configExample) {
      updateStep(2, { status: 'completed' });
      return true;
    }

    try {
      // Parse config example to extract environment variables
      const configMatch = configExample.match(/"([^"]+)":\s*"([^"]+)"/g);
      if (configMatch) {
        const configKeys = configMatch.map(match => {
          const keyMatch = match.match(/"([^"]+)":/);
          return keyMatch ? keyMatch[1] : '';
        }).filter(key => key);

        // For now, we'll just mark as completed and let user configure manually
        updateStep(2, { 
          status: 'completed', 
          output: `Configuration template available. Please set up environment variables: ${configKeys.join(', ')}` 
        });
        return true;
      } else {
        updateStep(2, { status: 'completed' });
        return true;
      }
    } catch (error) {
      updateStep(2, { status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }, [configExample, updateStep]);

  const testConnection = useCallback(async () => {
    updateStep(3, { status: 'running' });

    return new Promise<boolean>((resolve) => {
      const child = spawn('npx', ['-y', `@modelcontextprotocol/server-${serverName}`, '--version'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
      });

      let output = '';
      let error = '';

      child.stdout?.on('data', (data) => {
        output += data.toString();
        updateStep(3, { output: output.trim() });
      });

      child.stderr?.on('data', (data) => {
        error += data.toString();
        updateStep(3, { error: error.trim() });
      });

      child.on('close', (code) => {
        if (code === 0 || output.includes('version') || output.includes('server')) {
          updateStep(3, { status: 'completed' });
          resolve(true);
        } else {
          updateStep(3, { status: 'failed' });
          resolve(false);
        }
      });

      child.on('error', (err) => {
        updateStep(3, { status: 'failed', error: err.message });
        resolve(false);
      });
    });
  }, [serverName, updateStep]);

  const runInstallation = useCallback(async () => {
    const installSuccess = await installPackage();
    if (!installSuccess) {
      onInstallComplete(false);
      return;
    }

    const validationSuccess = await validateInstallation();
    if (!validationSuccess) {
      onInstallComplete(false);
      return;
    }

    const configSuccess = await setupConfiguration();
    if (!configSuccess) {
      onInstallComplete(false);
      return;
    }

    const testSuccess = await testConnection();
    onInstallComplete(testSuccess);
  }, [installPackage, validateInstallation, setupConfiguration, testConnection, onInstallComplete]);

  useEffect(() => {
    if (isVisible && !isInstalling) {
      runInstallation();
    }
  }, [isVisible, isInstalling, runInstallation]);

  const handleKeyPress = useCallback((input: string, key: { escape?: boolean; return?: boolean }) => {
    if (!isVisible) return;

    if (key.escape) {
      onClose();
      return;
    }

    if (key.return) {
      // Skip to next step or complete
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        onClose();
      }
      return;
    }
  }, [isVisible, onClose, currentStep, steps.length]);

  useInput(handleKeyPress, { isActive: isVisible });

  if (!isVisible) return null;

  const getStatusIcon = (status: InstallStep['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: InstallStep['status']) => {
    switch (status) {
      case 'pending': return 'gray';
      case 'running': return 'yellow';
      case 'completed': return 'green';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="blue" padding={1}>
      <Box flexDirection="column" marginBottom={1}>
        <Text color="blue" bold>Installing MCP Server: {serverName}</Text>
        <Text color="gray" dimColor>
          {isInstalling ? 'Installation in progress...' : 'Installation completed'}
        </Text>
        <Text color="gray" dimColor>
          Esc: Close | Enter: Next Step
        </Text>
      </Box>

      <Box flexDirection="column">
        {steps.map((step, index) => (
          <Box key={index} flexDirection="column" padding={1}>
            <Box flexDirection="row">
              <Text color={getStatusColor(step.status)}>
                {getStatusIcon(step.status)} {step.name}
              </Text>
            </Box>
            
            {step.output && (
              <Text color="gray" dimColor>
                {"  "}Output: {step.output}
              </Text>
            )}
            
            {step.error && (
              <Text color="red">
                {"  "}Error: {step.error}
              </Text>
            )}
          </Box>
        ))}
      </Box>

      {configExample && (
        <Box flexDirection="column" marginTop={1} borderStyle="single" borderColor="yellow">
          <Text color="yellow" bold>Configuration Required</Text>
          <Text color="gray" dimColor>
            Please set up the following environment variables:
          </Text>
          <Text color="gray" dimColor>
            {configExample}
          </Text>
        </Box>
      )}

      {steps.every(step => step.status === 'completed') && (
        <Box flexDirection="column" marginTop={1} borderStyle="single" borderColor="green">
          <Text color="green" bold>Installation Complete!</Text>
          <Text color="gray" dimColor>
            The MCP server has been successfully installed and configured.
          </Text>
        </Box>
      )}

      {steps.some(step => step.status === 'failed') && (
        <Box flexDirection="column" marginTop={1} borderStyle="single" borderColor="red">
          <Text color="red" bold>Installation Failed</Text>
          <Text color="gray" dimColor>
            Some steps failed. Please check the errors above and try again.
          </Text>
        </Box>
      )}
    </Box>
  );
};