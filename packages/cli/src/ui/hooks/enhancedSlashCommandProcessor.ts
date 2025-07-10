/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';

export interface EnhancedSlashCommandProcessorReturn {
  processEnhancedCommand: (input: string) => {
    isEnhancedCommand: boolean;
    command: string;
    args: string[];
    shouldHandle: boolean;
  };
}

export function useEnhancedSlashCommandProcessor(): EnhancedSlashCommandProcessorReturn {
  const processEnhancedCommand = useCallback((input: string) => {
    const trimmed = input.trim();
    
    // Enhanced commands with new functionality
    const enhancedCommands = [
      '/search',      // Search history
      '/files',       // File navigator
      '/config',      // Configuration manager
      '/export',      // Export history
      '/import',      // Import history
      '/stats',       // Enhanced statistics
      '/filter',      // Filter history by type
      '/clear-filter', // Clear current filter
      '/help-enhanced', // Enhanced help
    ];

    for (const command of enhancedCommands) {
      if (trimmed.startsWith(command)) {
        const args = trimmed.slice(command.length).trim().split(' ');
        return {
          isEnhancedCommand: true,
          command: command.slice(1), // Remove leading slash
          args: args.filter(arg => arg.length > 0),
          shouldHandle: true,
        };
      }
    }

    return {
      isEnhancedCommand: false,
      command: '',
      args: [],
      shouldHandle: false,
    };
  }, []);

  return {
    processEnhancedCommand,
  };
}

// Helper function to get enhanced command help
export function getEnhancedCommandHelp(): string {
  return `
Enhanced Commands:
  /search [query]     - Search through conversation history
  /files              - Open file navigator for context selection
  /config             - Open configuration manager
  /export [filename]  - Export conversation history to file
  /import [filename]  - Import conversation history from file
  /stats              - Show detailed session statistics
  /filter <type>      - Filter history by type (user, gemini, tool_group, error, info)
  /clear-filter       - Clear current history filter
  /help-enhanced      - Show this enhanced help
  `;
}