import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
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
const server = new Server(
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

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_project_info',
        description: 'Get information about the landing page project',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'analyze_code',
        description: 'Analyze code files in the project',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the file to analyze',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'list_project_files',
        description: 'List all files in the project structure',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'get_project_info':
      return await tools.getProjectInfo();

    case 'analyze_code':
      const filePath = args.filePath;
      return await tools.analyzeCode(filePath);

    case 'list_project_files':
      return await tools.listProjectFiles();

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('MCP Server started'); 