# MCP Server Integration Guide

This guide covers the enhanced MCP (Model Context Protocol) server integration features in the Gemini CLI, providing access to a wide range of useful tools and services.

## 🚀 Overview

The enhanced MCP server system provides:

- **15+ Popular MCP Servers**: Pre-configured servers for common use cases
- **Interactive Installation**: Guided setup and configuration
- **Automatic Configuration**: Environment variable management
- **Category Organization**: Servers grouped by functionality
- **Search & Discovery**: Easy server discovery and filtering

## 📋 Available MCP Servers

### Development Tools

#### GitHub Server
- **Package**: `@modelcontextprotocol/server-github`
- **Tools**: Repository management, issues, pull requests
- **Configuration**: GitHub Personal Access Token
- **Use Cases**: Code review, issue tracking, repository management

```bash
# Install
npm install -g @modelcontextprotocol/server-github

# Configure
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_your_token_here"
```

#### Filesystem Server
- **Package**: `@modelcontextprotocol/server-filesystem`
- **Tools**: Advanced file operations, directory management
- **Configuration**: None required
- **Use Cases**: File manipulation, directory operations

### Database Tools

#### SQLite Server
- **Package**: `@modelcontextprotocol/server-sqlite`
- **Tools**: Database queries, table management
- **Configuration**: Database file path
- **Use Cases**: Data analysis, database operations

#### PostgreSQL Server
- **Package**: `@modelcontextprotocol/server-postgres`
- **Tools**: Database operations, backup, management
- **Configuration**: Database connection string
- **Use Cases**: Production database management

### DevOps Tools

#### Docker Server
- **Package**: `@modelcontextprotocol/server-docker`
- **Tools**: Container management, image operations
- **Configuration**: Docker daemon access
- **Use Cases**: Container orchestration, deployment

#### Kubernetes Server
- **Package**: `@modelcontextprotocol/server-kubernetes`
- **Tools**: Cluster management, pod operations
- **Configuration**: kubectl configuration
- **Use Cases**: K8s cluster management, deployment

### Cloud Services

#### AWS Server
- **Package**: `@modelcontextprotocol/server-aws`
- **Tools**: EC2, S3, Lambda, CloudFormation
- **Configuration**: AWS credentials
- **Use Cases**: Cloud infrastructure management

```bash
# Configure AWS
export AWS_ACCESS_KEY_ID="your_access_key"
export AWS_SECRET_ACCESS_KEY="your_secret_key"
export AWS_REGION="us-west-2"
```

#### Google Cloud Server
- **Package**: `@modelcontextprotocol/server-google-cloud`
- **Tools**: Compute Engine, Cloud Storage, Functions
- **Configuration**: GCP service account
- **Use Cases**: GCP resource management

### Communication Tools

#### Slack Server
- **Package**: `@modelcontextprotocol/server-slack`
- **Tools**: Messaging, channel management, notifications
- **Configuration**: Slack bot token
- **Use Cases**: Team communication, notifications

#### Discord Server
- **Package**: `@modelcontextprotocol/server-discord`
- **Tools**: Bot operations, channel management
- **Configuration**: Discord bot token
- **Use Cases**: Community management, notifications

### Project Management

#### Jira Server
- **Package**: `@modelcontextprotocol/server-jira`
- **Tools**: Issue tracking, project management
- **Configuration**: Jira API credentials
- **Use Cases**: Agile project management

```bash
# Configure Jira
export JIRA_URL="https://your-domain.atlassian.net"
export JIRA_EMAIL="your-email@domain.com"
export JIRA_API_TOKEN="your-api-token"
```

### Productivity Tools

#### Notion Server
- **Package**: `@modelcontextprotocol/server-notion`
- **Tools**: Document management, database operations
- **Configuration**: Notion integration token
- **Use Cases**: Knowledge management, documentation

#### Calendar Server
- **Package**: `@modelcontextprotocol/server-calendar`
- **Tools**: Event management, scheduling
- **Configuration**: Google Calendar credentials
- **Use Cases**: Meeting scheduling, event management

### AI Services

#### OpenAI Server
- **Package**: `@modelcontextprotocol/server-openai`
- **Tools**: Chat completion, image generation, embeddings
- **Configuration**: OpenAI API key
- **Use Cases**: Additional AI capabilities

#### Anthropic Server
- **Package**: `@modelcontextprotocol/server-anthropic`
- **Tools**: Claude API integration
- **Configuration**: Anthropic API key
- **Use Cases**: Alternative AI model access

### Search & Data

#### Brave Search Server
- **Package**: `@modelcontextprotocol/server-brave-search`
- **Tools**: Web search, news search, image search
- **Configuration**: Brave API key
- **Use Cases**: Web research, information gathering

#### Weather Server
- **Package**: `@modelcontextprotocol/server-weather`
- **Tools**: Weather data, forecasts, alerts
- **Configuration**: OpenWeather API key
- **Use Cases**: Weather information, location data

## 🛠️ Installation & Setup

### Using the MCP Server Manager

1. **Access the Manager**:
   ```bash
   gemini
   /mcp-manager
   ```

2. **Browse Categories**:
   - Use arrow keys to navigate categories
   - Press Tab to view server details
   - Press Enter to select a server

3. **Install Server**:
   - The manager will guide you through installation
   - Automatic package installation
   - Configuration setup

### Manual Installation

For manual installation, follow these steps:

1. **Install the Package**:
   ```bash
   npm install -g @modelcontextprotocol/server-[server-name]
   ```

2. **Configure Environment Variables**:
   ```bash
   export SERVER_SPECIFIC_VAR="your_value"
   ```

3. **Add to CLI Configuration**:
   ```json
   {
     "mcpServers": {
       "serverName": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-[server-name]"],
         "env": {
           "SERVER_SPECIFIC_VAR": "$SERVER_SPECIFIC_VAR"
         }
       }
     }
   }
   ```

## 🔧 Configuration Examples

### GitHub Configuration
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "$GITHUB_TOKEN"
      }
    }
  }
}
```

### AWS Configuration
```json
{
  "mcpServers": {
    "aws": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-aws"],
      "env": {
        "AWS_ACCESS_KEY_ID": "$AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY": "$AWS_SECRET_ACCESS_KEY",
        "AWS_REGION": "$AWS_REGION"
      }
    }
  }
}
```

### Slack Configuration
```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "$SLACK_BOT_TOKEN",
        "SLACK_SIGNING_SECRET": "$SLACK_SIGNING_SECRET"
      }
    }
  }
}
```

## 🎯 Usage Examples

### GitHub Operations
```bash
# Get repository information
> Get information about the current repository

# Create an issue
> Create a new issue titled "Bug fix needed" with description "Critical bug in login system"

# Review pull requests
> List all open pull requests and provide a summary
```

### AWS Operations
```bash
# List EC2 instances
> Show me all running EC2 instances in the us-west-2 region

# Upload to S3
> Upload the build artifacts to the production S3 bucket

# Deploy Lambda function
> Deploy the latest version of the user-authentication Lambda function
```

### Database Operations
```bash
# Query database
> Run a query to get all users who signed up in the last 30 days

# Backup database
> Create a backup of the production database

# Analyze performance
> Show me the slowest queries in the database
```

### Docker Operations
```bash
# List containers
> Show me all running Docker containers

# Build image
> Build a new Docker image for the web application

# Deploy stack
> Deploy the microservices stack using Docker Compose
```

## 🔍 Troubleshooting

### Common Issues

#### Installation Failures
- **Problem**: Package installation fails
- **Solution**: Check Node.js version and npm permissions
- **Command**: `npm doctor`

#### Configuration Errors
- **Problem**: Server won't start due to missing config
- **Solution**: Verify environment variables are set correctly
- **Command**: `echo $VARIABLE_NAME`

#### Connection Issues
- **Problem**: Server connects but tools don't work
- **Solution**: Check API permissions and rate limits
- **Debug**: Use `/mcp desc` to see available tools

### Debug Commands

```bash
# List configured servers
/mcp

# Show server details
/mcp desc

# Test server connection
/mcp test [server-name]

# View server logs
/mcp logs [server-name]
```

## 🔐 Security Considerations

### API Key Management
- Store API keys in environment variables
- Use `.env` files for local development
- Never commit secrets to version control
- Rotate keys regularly

### Permissions
- Use least-privilege access
- Review API permissions regularly
- Monitor usage and costs
- Set up alerts for unusual activity

### Network Security
- Use HTTPS for all API communications
- Verify SSL certificates
- Monitor network traffic
- Use VPN for sensitive operations

## 📊 Monitoring & Analytics

### Usage Tracking
- Monitor API call frequency
- Track response times
- Monitor error rates
- Set up cost alerts

### Performance Metrics
- Server startup time
- Tool execution time
- Memory usage
- Network latency

## 🚀 Advanced Features

### Custom MCP Servers
Create your own MCP servers:

```javascript
// Example custom server
const { Server } = require('@modelcontextprotocol/server');

const server = new Server({
  name: 'my-custom-server',
  version: '1.0.0',
});

server.listTools(() => [
  {
    name: 'custom_tool',
    description: 'My custom tool',
    inputSchema: {
      type: 'object',
      properties: {
        input: { type: 'string' }
      }
    }
  }
]);

server.callTool('custom_tool', async (args) => {
  return { result: `Processed: ${args.input}` };
});

server.listen();
```

### Server Chaining
Chain multiple servers for complex workflows:

```json
{
  "mcpServers": {
    "github": { /* config */ },
    "aws": { /* config */ },
    "slack": { /* config */ }
  }
}
```

## 📚 Additional Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Official MCP Server Registry](https://github.com/modelcontextprotocol/server-registry)
- [CLI Configuration Guide](./docs/cli/configuration.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)

## 🤝 Contributing

To contribute MCP server configurations:

1. Fork the repository
2. Add server configuration to `MCPServerManager.tsx`
3. Update documentation
4. Submit a pull request

## 📝 Changelog

### Version 1.0.0
- Initial MCP server integration
- 15+ pre-configured servers
- Interactive installation manager
- Automatic configuration setup
- Category-based organization
- Search and filtering capabilities