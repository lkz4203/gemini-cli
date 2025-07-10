/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import * as fs from 'fs';
import * as path from 'path';

interface FileNavigatorProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectFile: (filePath: string) => void;
  currentDirectory: string;
}

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modified?: Date;
}

export const FileNavigator: React.FC<FileNavigatorProps> = ({
  isVisible,
  onClose,
  onSelectFile,
  currentDirectory,
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentPath, setCurrentPath] = useState(currentDirectory);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);

  const loadFiles = useCallback(async (dirPath: string) => {
    try {
      const items = await fs.promises.readdir(dirPath, { withFileTypes: true });
      const fileItems: FileItem[] = [];

      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        const stats = await fs.promises.stat(fullPath);
        
        fileItems.push({
          name: item.name,
          path: fullPath,
          isDirectory: item.isDirectory(),
          size: stats.size,
          modified: stats.mtime,
        });
      }

      // Sort: directories first, then files, both alphabetically
      fileItems.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      setFiles(fileItems);
      setFilteredFiles(fileItems);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      loadFiles(currentPath);
    }
  }, [isVisible, currentPath, loadFiles]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = files.filter(file => 
        file.name.toLowerCase().includes(query)
      );
      setFilteredFiles(filtered);
      setSelectedIndex(0);
    } else {
      setFilteredFiles(files);
    }
  }, [searchQuery, files]);

  const handleKeyPress = useCallback((input: string, key: { escape?: boolean; return?: boolean; upArrow?: boolean; downArrow?: boolean; backspace?: boolean; delete?: boolean }) => {
    if (!isVisible) return;

    if (key.escape) {
      onClose();
      return;
    }

    if (key.return) {
      const selectedFile = filteredFiles[selectedIndex];
      if (selectedFile) {
        if (selectedFile.isDirectory) {
          setCurrentPath(selectedFile.path);
          setSearchQuery('');
        } else {
          onSelectFile(selectedFile.path);
          onClose();
        }
      }
      return;
    }

    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(filteredFiles.length - 1, prev + 1));
      return;
    }

    if (key.backspace) {
      if (searchQuery.length > 0) {
        setSearchQuery(prev => prev.slice(0, -1));
      } else {
        // Go up one directory
        const parentPath = path.dirname(currentPath);
        if (parentPath !== currentPath) {
          setCurrentPath(parentPath);
        }
      }
      return;
    }

    // Handle regular text input for search
    if (input && input.length === 1) {
      setSearchQuery(prev => prev + input);
    }
  }, [isVisible, onClose, onSelectFile, filteredFiles, selectedIndex, currentPath, searchQuery]);

  useInput(handleKeyPress, { isActive: isVisible });

  if (!isVisible) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="green" padding={1}>
      <Box flexDirection="column" marginBottom={1}>
        <Text color="green" bold>File Navigator</Text>
        <Text color="gray" dimColor>
          Path: {currentPath}
        </Text>
        <Text color="gray" dimColor>
          Search: {searchQuery || '(none)'} | Found: {filteredFiles.length} items
        </Text>
        <Text color="gray" dimColor>
          ↑/↓: Navigate | Enter: Select/Open | Backspace: Search/Up | Esc: Close
        </Text>
      </Box>

      <Box flexDirection="column" height={15} overflowY="hidden">
        {filteredFiles.length === 0 ? (
          <Text color="yellow">No files found</Text>
        ) : (
          filteredFiles.map((file, index) => (
            <Box key={file.path} flexDirection="row">
              <Text color={index === selectedIndex ? "white" : "gray"}>
                {index === selectedIndex ? "▶ " : "  "}
              </Text>
              <Text color={index === selectedIndex ? "white" : file.isDirectory ? "blue" : "gray"}>
                {file.isDirectory ? "📁" : "📄"} {file.name}
              </Text>
              {!file.isDirectory && file.size && (
                <Text color="gray" dimColor>
                  {" "}({formatFileSize(file.size)})
                </Text>
              )}
              {file.modified && (
                <Text color="gray" dimColor>
                  {" "}- {formatDate(file.modified)}
                </Text>
              )}
            </Box>
          ))
        )}
      </Box>

      {filteredFiles.length > 15 && (
        <Text color="gray" dimColor>
          ... and {filteredFiles.length - 15} more items
        </Text>
      )}
    </Box>
  );
};