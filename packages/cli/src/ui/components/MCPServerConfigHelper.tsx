/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import * as fs from 'fs';

interface MCPConfigVariable {
  name: string;
  description: string;
  type: 'string' | 'password' | 'url' | 'file';
  required: boolean;
  example?: string;
  validation?: RegExp;
}

interface MCPServerConfigHelperProps {
  isVisible: boolean;
  onClose: () => void;
  serverName: string;
  configVariables: MCPConfigVariable[];
  onConfigComplete: (config: Record<string, string>) => void;
}

const SERVER_CONFIGS: Record<string, MCPConfigVariable[]> = {
  github: [
    {
      name: 'GITHUB_PERSONAL_ACCESS_TOKEN',
      description: 'GitHub Personal Access Token with repo scope',
      type: 'password',
      required: true,
      example: 'ghp_xxxxxxxxxxxxxxxxxxxx',
      validation: /^ghp_[a-zA-Z0-9]{36}$/
    }
  ],
  aws: [
    {
      name: 'AWS_ACCESS_KEY_ID',
      description: 'AWS Access Key ID',
      type: 'string',
      required: true,
      example: 'AKIAIOSFODNN7EXAMPLE',
      validation: /^AKIA[0-9A-Z]{16}$/
    },
    {
      name: 'AWS_SECRET_ACCESS_KEY',
      description: 'AWS Secret Access Key',
      type: 'password',
      required: true,
      example: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    },
    {
      name: 'AWS_REGION',
      description: 'AWS Region',
      type: 'string',
      required: true,
      example: 'us-west-2',
      validation: /^[a-z]{2}-[a-z]+-\d+$/
    }
  ],
  slack: [
    {
      name: 'SLACK_BOT_TOKEN',
      description: 'Slack Bot User OAuth Token',
      type: 'password',
      required: true,
      example: 'xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx',
      validation: /^xoxb-[a-zA-Z0-9-]+$/
    },
    {
      name: 'SLACK_SIGNING_SECRET',
      description: 'Slack App Signing Secret',
      type: 'password',
      required: true,
      example: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    }
  ],
  discord: [
    {
      name: 'DISCORD_BOT_TOKEN',
      description: 'Discord Bot Token',
      type: 'password',
      required: true,
      example: 'MTxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      validation: /^[A-Za-z0-9]{23,28}\.[\w-]{6,7}\.[\w-]{27,28}$/
    },
    {
      name: 'DISCORD_GUILD_ID',
      description: 'Discord Server (Guild) ID',
      type: 'string',
      required: true,
      example: '123456789012345678'
    }
  ],
  jira: [
    {
      name: 'JIRA_URL',
      description: 'Jira instance URL',
      type: 'url',
      required: true,
      example: 'https://your-domain.atlassian.net'
    },
    {
      name: 'JIRA_EMAIL',
      description: 'Jira account email',
      type: 'string',
      required: true,
      example: 'user@example.com',
      validation: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    {
      name: 'JIRA_API_TOKEN',
      description: 'Jira API Token',
      type: 'password',
      required: true,
      example: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    }
  ],
  notion: [
    {
      name: 'NOTION_TOKEN',
      description: 'Notion Integration Token',
      type: 'password',
      required: true,
      example: 'secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      validation: /^secret_[a-zA-Z0-9]{32}$/
    },
    {
      name: 'NOTION_DATABASE_ID',
      description: 'Notion Database ID (optional)',
      type: 'string',
      required: false,
      example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
    }
  ],
  openai: [
    {
      name: 'OPENAI_API_KEY',
      description: 'OpenAI API Key',
      type: 'password',
      required: true,
      example: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      validation: /^sk-[a-zA-Z0-9]{48}$/
    }
  ],
  anthropic: [
    {
      name: 'ANTHROPIC_API_KEY',
      description: 'Anthropic API Key',
      type: 'password',
      required: true,
      example: 'sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      validation: /^sk-ant-[a-zA-Z0-9]{48}$/
    }
  ],
  'brave-search': [
    {
      name: 'BRAVE_API_KEY',
      description: 'Brave Search API Key',
      type: 'password',
      required: true,
      example: 'BSA-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    }
  ],
  weather: [
    {
      name: 'OPENWEATHER_API_KEY',
      description: 'OpenWeatherMap API Key',
      type: 'password',
      required: true,
      example: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    }
  ],
  calendar: [
    {
      name: 'GOOGLE_CALENDAR_ID',
      description: 'Google Calendar ID',
      type: 'string',
      required: true,
      example: 'user@gmail.com'
    },
    {
      name: 'GOOGLE_APPLICATION_CREDENTIALS',
      description: 'Path to Google Service Account JSON file',
      type: 'file',
      required: true,
      example: '/path/to/service-account.json'
    }
  ]
};

export const MCPServerConfigHelper: React.FC<MCPServerConfigHelperProps> = ({
  isVisible,
  onClose,
  serverName,
  configVariables,
  onConfigComplete,
}) => {
  const [currentVariableIndex, setCurrentVariableIndex] = useState(0);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [currentInput, setCurrentInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const currentVariable = configVariables[currentVariableIndex];

  const validateInput = useCallback((name: string, value: string, variable: MCPConfigVariable): string | null => {
    if (variable.required && !value.trim()) {
      return 'This field is required';
    }

    if (variable.validation && value.trim()) {
      if (!variable.validation.test(value)) {
        return `Invalid format. Example: ${variable.example}`;
      }
    }

    if (variable.type === 'url' && value.trim()) {
      try {
        new URL(value);
      } catch {
        return 'Invalid URL format';
      }
    }

    if (variable.type === 'file' && value.trim()) {
      if (!fs.existsSync(value)) {
        return 'File does not exist';
      }
    }

    return null;
  }, []);

  const handleKeyPress = useCallback((input: string, key: { escape?: boolean; return?: boolean; backspace?: boolean; delete?: boolean }) => {
    if (!isVisible) return;

    if (key.escape) {
      onClose();
      return;
    }

    if (key.return) {
      if (currentVariable) {
        const error = validateInput(currentVariable.name, currentInput, currentVariable);
        
        if (error) {
          setValidationErrors(prev => ({ ...prev, [currentVariable.name]: error }));
          return;
        }

        // Save the value
        setConfigValues(prev => ({ ...prev, [currentVariable.name]: currentInput }));
        setValidationErrors(prev => ({ ...prev, [currentVariable.name]: '' }));
        setCurrentInput('');

        // Move to next variable or complete
        if (currentVariableIndex < configVariables.length - 1) {
          setCurrentVariableIndex(prev => prev + 1);
        } else {
          // All variables configured
          onConfigComplete(configValues);
          onClose();
        }
      }
      return;
    }

    if (key.backspace || key.delete) {
      setCurrentInput(prev => prev.slice(0, -1));
      return;
    }

    if (input && input.length === 1) {
      setCurrentInput(prev => prev + input);
    }
  }, [isVisible, onClose, currentVariable, currentInput, currentVariableIndex, configVariables, configValues, validateInput, onConfigComplete]);

  useInput(handleKeyPress, { isActive: isVisible });

  if (!isVisible) return null;

  const getInputType = (type: MCPConfigVariable['type']) => {
    switch (type) {
      case 'password':
        return '••••••••';
      case 'url':
        return 'https://example.com';
      case 'file':
        return '/path/to/file';
      default:
        return 'text';
    }
  };

  const getProgressPercentage = () => Math.round(((currentVariableIndex + 1) / configVariables.length) * 100);

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="green" padding={1}>
      <Box flexDirection="column" marginBottom={1}>
        <Text color="green" bold>Configure {serverName} MCP Server</Text>
        <Text color="gray" dimColor>
          Progress: {currentVariableIndex + 1} of {configVariables.length} ({getProgressPercentage()}%)
        </Text>
        <Text color="gray" dimColor>
          Enter: Save & Continue | Esc: Cancel
        </Text>
      </Box>

      {currentVariable && (
        <Box flexDirection="column">
          <Text color="white" bold>
            {currentVariable.name}
            {currentVariable.required && <Text color="red"> *</Text>}
          </Text>
          
          <Text color="gray" dimColor>
            {currentVariable.description}
          </Text>
          
          {currentVariable.example && (
            <Text color="gray" dimColor>
              Example: {currentVariable.example}
            </Text>
          )}

          <Box flexDirection="row" marginTop={1}>
            <Text color="cyan">Value: </Text>
            <Text color="white">
              {currentInput || getInputType(currentVariable.type)}
            </Text>
          </Box>

          {validationErrors[currentVariable.name] && (
            <Text color="red">
              Error: {validationErrors[currentVariable.name]}
            </Text>
          )}
        </Box>
      )}

      <Box flexDirection="column" marginTop={1}>
        <Text color="gray" dimColor>
          Configured variables: {Object.keys(configValues).length}
        </Text>
        {Object.entries(configValues).map(([key, value]) => (
          <Text key={key} color="gray" dimColor>
            {key}: {value.length > 20 ? value.substring(0, 20) + '...' : value}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

// Helper function to get config variables for a server
export const getServerConfigVariables = (serverName: string): MCPConfigVariable[] => SERVER_CONFIGS[serverName] || [];