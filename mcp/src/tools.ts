import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface ToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

export class ProjectTools {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  async getProjectInfo(): Promise<ToolResult> {
    try {
      const packageJsonPath = join(this.projectRoot, 'package.json');
      let packageInfo = 'Package.json not found';
      
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        packageInfo = `Project: ${packageJson.name}\nVersion: ${packageJson.version}\nDescription: ${packageJson.description}`;
      }

      return {
        content: [
          {
            type: 'text',
            text: `Landing Page Project Information:\n\n${packageInfo}\n\nThis is a Next.js project with:\n- Supabase integration\n- AI features (Chat, Quiz generation, Text extraction)\n- Modern UI components (shadcn/ui)\n- Authentication system\n- Dashboard with progress tracking\n- File upload capabilities`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting project info: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  async analyzeCode(filePath: string): Promise<ToolResult> {
    try {
      const fullPath = join(this.projectRoot, filePath);
      
      if (!existsSync(fullPath)) {
        return {
          content: [
            {
              type: 'text',
              text: `File not found: ${filePath}`,
            },
          ],
        };
      }

      const content = readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n').length;
      const size = content.length;

      return {
        content: [
          {
            type: 'text',
            text: `File Analysis: ${filePath}\n\nLines: ${lines}\nSize: ${size} characters\n\nContent preview:\n${content.substring(0, 500)}${content.length > 500 ? '...' : ''}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error analyzing file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  async listProjectFiles(): Promise<ToolResult> {
    try {
      const { readdirSync, statSync } = await import('fs');
      const { join } = await import('path');

      const listFiles = (dir: string, prefix = ''): string[] => {
        const items = readdirSync(dir);
        const files: string[] = [];
        
        for (const item of items) {
          if (item.startsWith('.') || item === 'node_modules' || item === '.next') {
            continue;
          }
          
          const fullPath = join(dir, item);
          const stat = statSync(fullPath);
          
          if (stat.isDirectory()) {
            files.push(`${prefix}📁 ${item}/`);
            files.push(...listFiles(fullPath, prefix + '  '));
          } else {
            files.push(`${prefix}📄 ${item}`);
          }
        }
        
        return files;
      };

      const files = listFiles(this.projectRoot);
      
      return {
        content: [
          {
            type: 'text',
            text: `Project Structure:\n\n${files.join('\n')}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error listing files: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }
} 