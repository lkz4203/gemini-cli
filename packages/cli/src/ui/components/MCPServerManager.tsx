/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';

interface MCPServer {
  name: string;
  description: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  category: string;
  popular: boolean;
  tools: string[];
  installCommand?: string;
  configExample?: string;
}

interface MCPServerManagerProps {
  isVisible: boolean;
  onClose: () => void;
  onServerAdd: (server: MCPServer) => void;
  configPath: string;
}

const POPULAR_MCP_SERVERS: MCPServer[] = [
  {
    name: 'github',
    description: 'GitHub API integration for repository management, issues, and pull requests',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    category: 'Development',
    popular: true,
    tools: ['get_repository', 'get_issues', 'get_pull_requests', 'create_issue', 'update_issue'],
    installCommand: 'npm install -g @modelcontextprotocol/server-github',
    configExample: `{
  "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
}`
  },
  {
    name: 'filesystem',
    description: 'Advanced file system operations and file management',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem'],
    category: 'System',
    popular: true,
    tools: ['read_file', 'write_file', 'list_directory', 'create_directory', 'delete_file'],
    installCommand: 'npm install -g @modelcontextprotocol/server-filesystem'
  },
  {
    name: 'sqlite',
    description: 'SQLite database operations and query execution',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sqlite'],
    category: 'Database',
    popular: true,
    tools: ['execute_query', 'list_tables', 'describe_table', 'create_table'],
    installCommand: 'npm install -g @modelcontextprotocol/server-sqlite'
  },
  {
    name: 'postgres',
    description: 'PostgreSQL database operations and management',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres'],
    category: 'Database',
    popular: true,
    tools: ['execute_query', 'list_databases', 'list_tables', 'backup_database'],
    installCommand: 'npm install -g @modelcontextprotocol/server-postgres',
    configExample: `{
  "DATABASE_URL": "postgresql://user:password@localhost:5432/dbname"
}`
  },
  {
    name: 'docker',
    description: 'Docker container and image management',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-docker'],
    category: 'DevOps',
    popular: true,
    tools: ['list_containers', 'list_images', 'run_container', 'stop_container', 'build_image'],
    installCommand: 'npm install -g @modelcontextprotocol/server-docker'
  },
  {
    name: 'kubernetes',
    description: 'Kubernetes cluster management and operations',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-kubernetes'],
    category: 'DevOps',
    popular: true,
    tools: ['list_pods', 'list_services', 'get_pod_logs', 'apply_manifest', 'delete_resource'],
    installCommand: 'npm install -g @modelcontextprotocol/server-kubernetes'
  },
  {
    name: 'aws',
    description: 'AWS services integration (EC2, S3, Lambda, etc.)',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-aws'],
    category: 'Cloud',
    popular: true,
    tools: ['list_ec2_instances', 'upload_to_s3', 'invoke_lambda', 'list_s3_buckets'],
    installCommand: 'npm install -g @modelcontextprotocol/server-aws',
    configExample: `{
  "AWS_ACCESS_KEY_ID": "your-access-key",
  "AWS_SECRET_ACCESS_KEY": "your-secret-key",
  "AWS_REGION": "us-west-2"
}`
  },
  {
    name: 'google-cloud',
    description: 'Google Cloud Platform services integration',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-google-cloud'],
    category: 'Cloud',
    popular: true,
    tools: ['list_instances', 'upload_to_storage', 'deploy_function', 'list_buckets'],
    installCommand: 'npm install -g @modelcontextprotocol/server-google-cloud'
  },
  {
    name: 'slack',
    description: 'Slack workspace integration for messaging and notifications',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-slack'],
    category: 'Communication',
    popular: true,
    tools: ['send_message', 'list_channels', 'get_channel_history', 'create_channel'],
    installCommand: 'npm install -g @modelcontextprotocol/server-slack',
    configExample: `{
  "SLACK_BOT_TOKEN": "xoxb-your-bot-token",
  "SLACK_SIGNING_SECRET": "your-signing-secret"
}`
  },
  {
    name: 'discord',
    description: 'Discord server integration for bot operations',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-discord'],
    category: 'Communication',
    popular: true,
    tools: ['send_message', 'list_channels', 'get_messages', 'create_channel'],
    installCommand: 'npm install -g @modelcontextprotocol/server-discord',
    configExample: `{
  "DISCORD_BOT_TOKEN": "your-bot-token",
  "DISCORD_GUILD_ID": "your-guild-id"
}`
  },
  {
    name: 'jira',
    description: 'Jira project management and issue tracking',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-jira'],
    category: 'Project Management',
    popular: true,
    tools: ['get_issues', 'create_issue', 'update_issue', 'list_projects', 'get_boards'],
    installCommand: 'npm install -g @modelcontextprotocol/server-jira',
    configExample: `{
  "JIRA_URL": "https://your-domain.atlassian.net",
  "JIRA_EMAIL": "your-email@domain.com",
  "JIRA_API_TOKEN": "your-api-token"
}`
  },
  {
    name: 'notion',
    description: 'Notion workspace integration for document management',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-notion'],
    category: 'Productivity',
    popular: true,
    tools: ['get_page', 'create_page', 'update_page', 'search_pages', 'list_databases'],
    installCommand: 'npm install -g @modelcontextprotocol/server-notion',
    configExample: `{
  "NOTION_TOKEN": "secret_your-integration-token",
  "NOTION_DATABASE_ID": "your-database-id"
}`
  },
  {
    name: 'openai',
    description: 'OpenAI API integration for additional AI capabilities',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-openai'],
    category: 'AI',
    popular: true,
    tools: ['create_chat_completion', 'create_image', 'create_embedding', 'list_models'],
    installCommand: 'npm install -g @modelcontextprotocol/server-openai',
    configExample: `{
  "OPENAI_API_KEY": "sk-your-api-key"
}`
  },
  {
    name: 'anthropic',
    description: 'Anthropic Claude API integration',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-anthropic'],
    category: 'AI',
    popular: true,
    tools: ['create_message', 'list_models', 'create_embedding'],
    installCommand: 'npm install -g @modelcontextprotocol/server-anthropic',
    configExample: `{
  "ANTHROPIC_API_KEY": "sk-ant-your-api-key"
}`
  },
  {
    name: 'brave-search',
    description: 'Brave Search API for web search capabilities',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    category: 'Search',
    popular: true,
    tools: ['search_web', 'search_news', 'search_images'],
    installCommand: 'npm install -g @modelcontextprotocol/server-brave-search',
    configExample: `{
  "BRAVE_API_KEY": "your-brave-api-key"
}`
  },
  {
    name: 'weather',
    description: 'Weather data and forecasts from various providers',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-weather'],
    category: 'Data',
    popular: false,
    tools: ['get_current_weather', 'get_forecast', 'get_weather_alerts'],
    installCommand: 'npm install -g @modelcontextprotocol/server-weather',
    configExample: `{
  "OPENWEATHER_API_KEY": "your-openweather-api-key"
}`
  },
  {
    name: 'calendar',
    description: 'Google Calendar integration for event management',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-calendar'],
    category: 'Productivity',
    popular: false,
    tools: ['list_events', 'create_event', 'update_event', 'delete_event'],
    installCommand: 'npm install -g @modelcontextprotocol/server-calendar',
    configExample: `{
  "GOOGLE_CALENDAR_ID": "your-calendar-id",
  "GOOGLE_APPLICATION_CREDENTIALS": "path/to/credentials.json"
}`
  }
];

export const MCPServerManager: React.FC<MCPServerManagerProps> = ({
  isVisible,
  onClose,
  onServerAdd,
  configPath: _configPath,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedServer, setSelectedServer] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredServers, setFilteredServers] = useState<MCPServer[]>(POPULAR_MCP_SERVERS);

  const categories = Array.from(new Set(POPULAR_MCP_SERVERS.map(server => server.category))).sort();

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = POPULAR_MCP_SERVERS.filter(server => 
        server.name.toLowerCase().includes(query) ||
        server.description.toLowerCase().includes(query) ||
        server.category.toLowerCase().includes(query) ||
        server.tools.some(tool => tool.toLowerCase().includes(query))
      );
      setFilteredServers(filtered);
    } else {
      setFilteredServers(POPULAR_MCP_SERVERS);
    }
  }, [searchQuery]);

  const handleKeyPress = useCallback((input: string, key: { escape?: boolean; return?: boolean; upArrow?: boolean; downArrow?: boolean; leftArrow?: boolean; rightArrow?: boolean; tab?: boolean; backspace?: boolean; delete?: boolean }) => {
    if (!isVisible) return;

    if (key.escape) {
      if (showDetails) {
        setShowDetails(false);
      } else {
        onClose();
      }
      return;
    }

    if (key.return) {
      if (showDetails) {
        // Add the selected server
        const currentServer = filteredServers[selectedServer];
        if (currentServer) {
          onServerAdd(currentServer);
          onClose();
        }
      } else {
        setShowDetails(true);
      }
      return;
    }

    if (key.tab) {
      setShowDetails(!showDetails);
      return;
    }

    if (key.upArrow) {
      if (showDetails) {
        // Navigate within details view
        return;
      } else {
        if (selectedServer > 0) {
          setSelectedServer(prev => prev - 1);
        } else if (selectedCategory > 0) {
          setSelectedCategory(prev => prev - 1);
          setSelectedServer(0);
        }
      }
      return;
    }

    if (key.downArrow) {
      if (showDetails) {
        // Navigate within details view
        return;
      } else {
        const currentCategoryServers = filteredServers.filter(server => server.category === categories[selectedCategory]);
        if (selectedServer < currentCategoryServers.length - 1) {
          setSelectedServer(prev => prev + 1);
        } else if (selectedCategory < categories.length - 1) {
          setSelectedCategory(prev => prev + 1);
          setSelectedServer(0);
        }
      }
      return;
    }

    if (key.leftArrow) {
      if (selectedCategory > 0) {
        setSelectedCategory(prev => prev - 1);
        setSelectedServer(0);
      }
      return;
    }

    if (key.rightArrow) {
      if (selectedCategory < categories.length - 1) {
        setSelectedCategory(prev => prev + 1);
        setSelectedServer(0);
      }
      return;
    }

    if (key.backspace || key.delete) {
      setSearchQuery(prev => prev.slice(0, -1));
      return;
    }

    if (input && input.length === 1) {
      setSearchQuery(prev => prev + input);
    }
  }, [isVisible, onClose, showDetails, selectedServer, selectedCategory, categories, filteredServers, onServerAdd]);

  useInput(handleKeyPress, { isActive: isVisible });

  if (!isVisible) return null;

  const currentCategory = categories[selectedCategory];
  const categoryServers = filteredServers.filter(server => server.category === currentCategory);
  const currentServer = categoryServers[selectedServer];

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="yellow" padding={1}>
      <Box flexDirection="column" marginBottom={1}>
        <Text color="yellow" bold>MCP Server Manager</Text>
        <Text color="gray" dimColor>
          Search: {searchQuery || '(none)'} | Found: {filteredServers.length} servers
        </Text>
        <Text color="gray" dimColor>
          ↑/↓: Navigate | Enter: Select/Add | Tab: Toggle Details | ←/→: Change Category | Esc: Close
        </Text>
      </Box>

      <Box flexDirection="row">
        {/* Categories */}
        <Box flexDirection="column" width={20} borderStyle="single" borderColor="gray" marginRight={1}>
          {categories.map((category, index) => (
            <Box key={category} padding={1}>
              <Text color={index === selectedCategory ? "yellow" : "gray"}>
                {index === selectedCategory ? "▶ " : "  "}{category}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Servers */}
        <Box flexDirection="column" flexGrow={1} marginRight={1}>
          <Text color="white" bold>{currentCategory}</Text>
          {categoryServers.map((server, index) => (
            <Box key={server.name} padding={1}>
              <Text color={index === selectedServer ? "yellow" : "white"}>
                {index === selectedServer ? "▶ " : "  "}{server.name}
                {server.popular && " ⭐"}
              </Text>
              <Text color="gray" dimColor>
                {"  "}{server.description}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Details */}
        {showDetails && currentServer && (
          <Box flexDirection="column" width={40} borderStyle="single" borderColor="gray">
            <Text color="white" bold>{currentServer.name}</Text>
            <Text color="gray" dimColor>{currentServer.description}</Text>
            
            <Text color="cyan" bold>Tools:</Text>
            {currentServer.tools.map((tool, index) => (
              <Text key={index} color="gray" dimColor>
                • {tool}
              </Text>
            ))}

            {currentServer.installCommand && (
              <>
                <Text color="green" bold>Install:</Text>
                <Text color="gray" dimColor>{currentServer.installCommand}</Text>
              </>
            )}

            {currentServer.configExample && (
              <>
                <Text color="magenta" bold>Config:</Text>
                <Text color="gray" dimColor>{currentServer.configExample}</Text>
              </>
            )}

            <Text color="yellow" bold>
              Press Enter to add this server
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};