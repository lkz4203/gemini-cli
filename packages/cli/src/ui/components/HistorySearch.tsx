/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { HistoryItem } from '../types.js';

interface HistorySearchProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectItem: (item: HistoryItem) => void;
  filteredHistory: HistoryItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export const HistorySearch: React.FC<HistorySearchProps> = ({
  isVisible,
  onClose,
  onSelectItem,
  filteredHistory,
  searchQuery,
  setSearchQuery,
  currentFilter,
  onFilterChange,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleKeyPress = useCallback((input: string, key: { escape?: boolean; return?: boolean; upArrow?: boolean; downArrow?: boolean; tab?: boolean; backspace?: boolean; delete?: boolean }) => {
    if (!isVisible) return;

    if (key.escape) {
      onClose();
      return;
    }

    if (key.return) {
      if (filteredHistory[selectedIndex]) {
        onSelectItem(filteredHistory[selectedIndex]);
        onClose();
      }
      return;
    }

    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(filteredHistory.length - 1, prev + 1));
      return;
    }

    if (key.tab) {
      // Cycle through filter options
      const filters = ['user', 'gemini', 'tool_group', 'error', 'info'];
      const currentIndex = filters.indexOf(currentFilter || '');
      const nextIndex = (currentIndex + 1) % filters.length;
      onFilterChange(filters[nextIndex] || null);
      return;
    }

    // Handle regular text input for search
    if (input && input.length === 1) {
      setSearchQuery(searchQuery + input);
      setSelectedIndex(0);
    }

    if (key.backspace || key.delete) {
      setSearchQuery(searchQuery.slice(0, -1));
      setSelectedIndex(0);
    }
  }, [isVisible, onClose, onSelectItem, filteredHistory, selectedIndex, currentFilter, onFilterChange, setSearchQuery, searchQuery]);

  useInput(handleKeyPress, { isActive: isVisible });

  if (!isVisible) return null;

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="blue" padding={1}>
      <Box flexDirection="column" marginBottom={1}>
        <Text color="blue" bold>History Search</Text>
        <Text color="gray" dimColor>
          Search: {searchQuery || '(none)'} | Filter: {currentFilter || 'all'} | 
          Found: {filteredHistory.length} items
        </Text>
        <Text color="gray" dimColor>
          ↑/↓: Navigate | Enter: Select | Tab: Filter | Esc: Close
        </Text>
      </Box>

      <Box flexDirection="column" height={10} overflowY="hidden">
        {filteredHistory.length === 0 ? (
          <Text color="yellow">No items found</Text>
        ) : (
          filteredHistory.slice(0, 10).map((item, index) => (
            <Box key={item.id} flexDirection="row">
              <Text color={index === selectedIndex ? "white" : "gray"}>
                {index === selectedIndex ? "▶ " : "  "}
              </Text>
              <Text color={index === selectedIndex ? "white" : "gray"}>
                [{item.type}] {item.text?.substring(0, 60) || 'No text'}...
              </Text>
            </Box>
          ))
        )}
      </Box>

      {filteredHistory.length > 10 && (
        <Text color="gray" dimColor>
          ... and {filteredHistory.length - 10} more items
        </Text>
      )}
    </Box>
  );
};