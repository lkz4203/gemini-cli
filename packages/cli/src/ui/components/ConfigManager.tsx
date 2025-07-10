/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import * as fs from 'fs';
import * as path from 'path';

interface ConfigManagerProps {
  isVisible: boolean;
  onClose: () => void;
  onConfigChange: () => void;
  configPath: string;
}

interface ConfigSection {
  name: string;
  description: string;
  settings: ConfigSetting[];
}

interface ConfigSetting {
  key: string;
  value: unknown;
  type: 'string' | 'boolean' | 'number' | 'array' | 'object';
  description: string;
  options?: string[];
}

export const ConfigManager: React.FC<ConfigManagerProps> = ({
  isVisible,
  onClose,
  onConfigChange,
  configPath,
}) => {
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [selectedSection, setSelectedSection] = useState(0);
  const [selectedSetting, setSelectedSetting] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [sections, setSections] = useState<ConfigSection[]>([]);

  const loadConfig = useCallback(async () => {
    try {
      if (fs.existsSync(configPath)) {
        const configData = await fs.promises.readFile(configPath, 'utf8');
        const parsedConfig = JSON.parse(configData);
        setConfig(parsedConfig);
        
        // Organize config into sections
        const configSections: ConfigSection[] = [
          {
            name: 'Authentication',
            description: 'Authentication and API settings',
            settings: [
              { key: 'selectedAuthType', value: parsedConfig.selectedAuthType, type: 'string', description: 'Authentication method' },
              { key: 'apiKey', value: parsedConfig.apiKey, type: 'string', description: 'API key (if using key-based auth)' },
            ]
          },
          {
            name: 'Interface',
            description: 'UI and display settings',
            settings: [
              { key: 'theme', value: parsedConfig.theme, type: 'string', description: 'Visual theme', options: ['Default', 'GitHub', 'Dark', 'Light'] },
              { key: 'hideTips', value: parsedConfig.hideTips, type: 'boolean', description: 'Hide helpful tips' },
              { key: 'autoAccept', value: parsedConfig.autoAccept, type: 'boolean', description: 'Auto-accept safe tool calls' },
            ]
          },
          {
            name: 'Tools & Extensions',
            description: 'Tool configuration and MCP servers',
            settings: [
              { key: 'coreTools', value: parsedConfig.coreTools, type: 'array', description: 'Core tools to enable' },
              { key: 'excludeTools', value: parsedConfig.excludeTools, type: 'array', description: 'Tools to exclude' },
              { key: 'mcpServers', value: parsedConfig.mcpServers, type: 'object', description: 'MCP server configuration' },
            ]
          },
          {
            name: 'Performance',
            description: 'Performance and memory settings',
            settings: [
              { key: 'sandbox', value: parsedConfig.sandbox, type: 'string', description: 'Sandbox mode', options: ['false', 'docker', 'podman'] },
              { key: 'autoConfigureMaxOldSpaceSize', value: parsedConfig.autoConfigureMaxOldSpaceSize, type: 'boolean', description: 'Auto-configure memory' },
              { key: 'checkpointing', value: parsedConfig.checkpointing, type: 'object', description: 'Checkpointing configuration' },
            ]
          }
        ];
        
        setSections(configSections);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }, [configPath]);

  useEffect(() => {
    if (isVisible) {
      loadConfig();
    }
  }, [isVisible, loadConfig]);

  const saveConfig = useCallback(async () => {
    try {
      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        await fs.promises.mkdir(configDir, { recursive: true });
      }
      await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2));
      onConfigChange();
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }, [config, configPath, onConfigChange]);

  const handleKeyPress = useCallback((input: string, key: { escape?: boolean; return?: boolean; upArrow?: boolean; downArrow?: boolean; leftArrow?: boolean; rightArrow?: boolean; backspace?: boolean; delete?: boolean }) => {
    if (!isVisible) return;

    if (key.escape) {
      if (isEditing) {
        setIsEditing(false);
        setEditValue('');
      } else {
        onClose();
      }
      return;
    }

    if (isEditing) {
      if (key.return) {
        // Save the edited value
        const currentSection = sections[selectedSection];
        const currentSetting = currentSection.settings[selectedSetting];
        
        let newValue: unknown = editValue;
        if (currentSetting.type === 'boolean') {
          newValue = editValue.toLowerCase() === 'true';
        } else if (currentSetting.type === 'number') {
          newValue = parseFloat(editValue);
        } else if (currentSetting.type === 'array') {
          try {
            newValue = JSON.parse(editValue);
          } catch {
            newValue = editValue.split(',').map(s => s.trim());
          }
        } else if (currentSetting.type === 'object') {
          try {
            newValue = JSON.parse(editValue);
          } catch {
            // Keep as string if invalid JSON
            newValue = editValue;
          }
        }

        setConfig((prev: Record<string, unknown>) => ({
          ...prev,
          [currentSetting.key]: newValue
        }));
        
        setIsEditing(false);
        setEditValue('');
        saveConfig();
        return;
      }

      if (key.backspace || key.delete) {
        setEditValue(prev => prev.slice(0, -1));
        return;
      }

      if (input && input.length === 1) {
        setEditValue(prev => prev + input);
      }
      return;
    }

    if (key.return) {
      setIsEditing(true);
      const currentSection = sections[selectedSection];
      const currentSetting = currentSection.settings[selectedSetting];
      setEditValue(JSON.stringify(currentSetting.value));
      return;
    }

    if (key.upArrow) {
      if (selectedSetting > 0) {
        setSelectedSetting(prev => prev - 1);
      } else if (selectedSection > 0) {
        setSelectedSection(prev => prev - 1);
        setSelectedSetting(0);
      }
      return;
    }

    if (key.downArrow) {
      const currentSection = sections[selectedSection];
      if (selectedSetting < currentSection.settings.length - 1) {
        setSelectedSetting(prev => prev + 1);
      } else if (selectedSection < sections.length - 1) {
        setSelectedSection(prev => prev + 1);
        setSelectedSetting(0);
      }
      return;
    }

    if (key.leftArrow) {
      if (selectedSection > 0) {
        setSelectedSection(prev => prev - 1);
        setSelectedSetting(0);
      }
      return;
    }

    if (key.rightArrow) {
      if (selectedSection < sections.length - 1) {
        setSelectedSection(prev => prev + 1);
        setSelectedSetting(0);
      }
      return;
    }
  }, [isVisible, onClose, isEditing, editValue, sections, selectedSection, selectedSetting, saveConfig]);

  useInput(handleKeyPress, { isActive: isVisible });

  if (!isVisible) return null;

  const currentSection = sections[selectedSection];
  const currentSetting = currentSection?.settings[selectedSetting];

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
      <Box flexDirection="column" marginBottom={1}>
        <Text color="cyan" bold>Configuration Manager</Text>
        <Text color="gray" dimColor>
          Config: {configPath}
        </Text>
        <Text color="gray" dimColor>
          ↑/↓: Navigate | Enter: Edit | ←/→: Change Section | Esc: Close
        </Text>
      </Box>

      <Box flexDirection="row">
        {/* Sections */}
        <Box flexDirection="column" width={20} borderStyle="single" borderColor="gray">
          {sections.map((section, index) => (
            <Box key={section.name} padding={1}>
              <Text color={index === selectedSection ? "cyan" : "gray"}>
                {index === selectedSection ? "▶ " : "  "}{section.name}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Settings */}
        <Box flexDirection="column" flexGrow={1} marginLeft={1}>
          {currentSection && (
            <>
              <Text color="white" bold>{currentSection.name}</Text>
              <Text color="gray" dimColor>{currentSection.description}</Text>
              
              <Box flexDirection="column" marginTop={1}>
                {currentSection.settings.map((setting, index) => (
                  <Box key={setting.key} flexDirection="column" padding={1}>
                    <Box flexDirection="row">
                      <Text color={index === selectedSetting ? "cyan" : "white"}>
                        {index === selectedSetting ? "▶ " : "  "}{setting.key}:
                      </Text>
                      <Text color="gray" dimColor>
                        {" "}({setting.type})
                      </Text>
                    </Box>
                    <Text color="gray" dimColor>
                      {"  "}{setting.description}
                    </Text>
                    <Text color="yellow">
                      {"  "}Value: {JSON.stringify(setting.value)}
                    </Text>
                    {setting.options && (
                      <Text color="gray" dimColor>
                        {"  "}Options: {setting.options.join(', ')}
                      </Text>
                    )}
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Box>

      {isEditing && (
        <Box flexDirection="column" marginTop={1} borderStyle="round" borderColor="yellow">
          <Text color="yellow" bold>Editing: {currentSetting?.key}</Text>
          <Text color="white">Value: {editValue}</Text>
          <Text color="gray" dimColor>Press Enter to save, Esc to cancel</Text>
        </Box>
      )}
    </Box>
  );
};