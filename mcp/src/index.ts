import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ProjectTools } from './tools.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the project root (parent directory of mcp folder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');

// Initialize tools
const tools = new ProjectTools(projectRoot);

// Initialize the server
const server = new McpServer(
  {
    name: 'landing-page-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.registerTool('get_project_info', {
  title: 'Get Project Info',
  description: 'Get information about the landing page project',
  inputSchema: {},
}, async () => {
  const result = await tools.getProjectInfo();
  return {
    content: result.content,
  };
});

server.registerTool('analyze_code', {
  title: 'Analyze Code',
  description: 'Analyze code files in the project',
  inputSchema: {
    filePath: z.string().describe('Path to the file to analyze'),
  },
}, async ({ filePath }) => {
  const result = await tools.analyzeCode(filePath);
  return {
    content: result.content,
  };
});

server.registerTool('list_project_files', {
  title: 'List Project Files',
  description: 'List all files in the project structure',
  inputSchema: {},
}, async () => {
  const result = await tools.listProjectFiles();
  return {
    content: result.content,
  };
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('MCP Server started'); 