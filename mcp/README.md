# MCP Server for Landing Page Project

This is a Model Context Protocol (MCP) server implementation for the Landing Page project. It provides tools for analyzing and interacting with the project codebase.

## Features

- **Project Information**: Get detailed information about the project structure and dependencies
- **Code Analysis**: Analyze specific files in the project
- **File Listing**: List all files in the project structure

## Setup

1. Install dependencies:
```bash
cd mcp
npm install
```

2. Build the project:
```bash
npm run build
```

3. Run the server:
```bash
npm start
```

## Development

For development with hot reloading:
```bash
npm run dev
```

## Available Tools

### get_project_info
Returns information about the project including package.json details and project features.

### analyze_code
Analyzes a specific file in the project.
- **Parameters**: `filePath` (string) - Path to the file to analyze
- **Returns**: File content, line count, and size information

### list_project_files
Lists all files in the project structure with a tree-like format.

## Configuration

The server is configured to work with the parent project directory. It automatically detects the project root and provides tools for analyzing the codebase.

## Integration

This MCP server can be integrated with MCP clients to provide AI assistants with context about the Landing Page project structure and codebase.

## License

MIT 