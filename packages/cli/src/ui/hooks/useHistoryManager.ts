/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import { HistoryItem } from '../types.js';

// Type for the updater function passed to updateHistoryItem
type HistoryItemUpdater = (
  prevItem: HistoryItem,
) => Partial<Omit<HistoryItem, 'id'>>;

export interface UseHistoryManagerReturn {
  history: HistoryItem[];
  filteredHistory: HistoryItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addItem: (itemData: Omit<HistoryItem, 'id'>, baseTimestamp: number) => number; // Returns the generated ID
  updateItem: (
    id: number,
    updates: Partial<Omit<HistoryItem, 'id'>> | HistoryItemUpdater,
  ) => void;
  clearItems: () => void;
  loadHistory: (newHistory: HistoryItem[]) => void;
  exportHistory: () => string;
  importHistory: (historyData: string) => boolean;
  getHistoryStats: () => {
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    toolCalls: number;
    errors: number;
  };
  filterByType: (type: string) => void;
  clearFilter: () => void;
  currentFilter: string | null;
}

/**
 * Custom hook to manage the chat history state with enhanced features.
 *
 * Encapsulates the history array, message ID generation, adding items,
 * updating items, clearing the history, and provides search/filter capabilities.
 */
export function useHistory(): UseHistoryManagerReturn {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentFilter, setCurrentFilter] = useState<string | null>(null);
  const messageIdCounterRef = useRef(0);

  // Generates a unique message ID based on a timestamp and a counter.
  const getNextMessageId = useCallback((baseTimestamp: number): number => {
    messageIdCounterRef.current += 1;
    return baseTimestamp + messageIdCounterRef.current;
  }, []);

  // Filter history based on search query and type filter
  const filteredHistory = useMemo(() => {
    let filtered = history;

    // Apply type filter first
    if (currentFilter) {
      filtered = filtered.filter(item => item.type === currentFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        // Search in text content
        if (item.text?.toLowerCase().includes(query)) {
          return true;
        }
        
        // Search in tool group items
        if (item.type === 'tool_group' && item.tools) {
          return item.tools.some(tool => 
            tool.name?.toLowerCase().includes(query) ||
            tool.description?.toLowerCase().includes(query)
          );
        }
        
        return false;
      });
    }

    return filtered;
  }, [history, searchQuery, currentFilter]);

  const loadHistory = useCallback((newHistory: HistoryItem[]) => {
    setHistory(newHistory);
  }, []);

  // Adds a new item to the history state with a unique ID.
  const addItem = useCallback(
    (itemData: Omit<HistoryItem, 'id'>, baseTimestamp: number): number => {
      const id = getNextMessageId(baseTimestamp);
      const newItem: HistoryItem = { ...itemData, id } as HistoryItem;

      setHistory((prevHistory) => {
        if (prevHistory.length > 0) {
          const lastItem = prevHistory[prevHistory.length - 1];
          // Prevent adding duplicate consecutive user messages
          if (
            lastItem.type === 'user' &&
            newItem.type === 'user' &&
            lastItem.text === newItem.text
          ) {
            return prevHistory; // Don't add the duplicate
          }
        }
        return [...prevHistory, newItem];
      });
      return id; // Return the generated ID (even if not added, to keep signature)
    },
    [getNextMessageId],
  );

  /**
   * Updates an existing history item identified by its ID.
   * @deprecated Prefer not to update history item directly as we are currently
   * rendering all history items in <Static /> for performance reasons. Only use
   * if ABSOLUTELY NECESSARY
   */
  const updateItem = useCallback(
    (
      id: number,
      updates: Partial<Omit<HistoryItem, 'id'>> | HistoryItemUpdater,
    ) => {
      setHistory((prevHistory) =>
        prevHistory.map((item) => {
          if (item.id === id) {
            // Apply updates based on whether it's an object or a function
            const newUpdates =
              typeof updates === 'function' ? updates(item) : updates;
            return { ...item, ...newUpdates } as HistoryItem;
          }
          return item;
        }),
      );
    },
    [],
  );

  // Clears the entire history state and resets the ID counter.
  const clearItems = useCallback(() => {
    setHistory([]);
    messageIdCounterRef.current = 0;
    setSearchQuery('');
    setCurrentFilter(null);
  }, []);

  // Export history as JSON string
  const exportHistory = useCallback(() => JSON.stringify({
      version: '1.0',
      timestamp: new Date().toISOString(),
      history,
      stats: {
        totalMessages: history.length,
        userMessages: history.filter(item => item.type === 'user').length,
        assistantMessages: history.filter(item => item.type === 'gemini').length,
        toolCalls: history.filter(item => item.type === 'tool_group').length,
        errors: history.filter(item => item.type === 'error').length,
      }
    }, null, 2), [history]);

  // Import history from JSON string
  const importHistory = useCallback((historyData: string): boolean => {
    try {
      const parsed = JSON.parse(historyData);
      if (parsed.history && Array.isArray(parsed.history)) {
        setHistory(parsed.history);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }, []);

  // Get history statistics
  const getHistoryStats = useCallback(() => ({
      totalMessages: history.length,
      userMessages: history.filter(item => item.type === 'user').length,
      assistantMessages: history.filter(item => item.type === 'gemini').length,
      toolCalls: history.filter(item => item.type === 'tool_group').length,
      errors: history.filter(item => item.type === 'error').length,
    }), [history]);

  // Filter by message type
  const filterByType = useCallback((type: string) => {
    setCurrentFilter(type);
  }, []);

  // Clear current filter
  const clearFilter = useCallback(() => {
    setCurrentFilter(null);
    setSearchQuery('');
  }, []);

  return {
    history,
    filteredHistory,
    searchQuery,
    setSearchQuery,
    addItem,
    updateItem,
    clearItems,
    loadHistory,
    exportHistory,
    importHistory,
    getHistoryStats,
    filterByType,
    clearFilter,
    currentFilter,
  };
}
