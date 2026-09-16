'use server';

import { experimental_createMCPClient as createMCPClient } from '@ai-sdk/mcp';

import { generateMcpToolName } from '@/components/TextareaLlm/ConfigureToolsModal/getMcpTools/helpers';
import { McpProtocol } from '@/config/mcpServers';

export async function getMcpTools({
  mcpUrl,
  protocol = 'http',
}: {
  mcpUrl: string;
  protocol?: McpProtocol;
}) {
  if (!mcpUrl) {
    return {};
  }
  const mcpClient = await createMCPClient({
    transport: {
      type: protocol,
      url: mcpUrl,
    },
  });
  return await mcpClient.tools();
}

export async function getMcpToolList({
  mcpUrl,
  protocol = 'http',
}: {
  mcpUrl: string;
  protocol?: McpProtocol;
}) {
  try {
    const mcpTools = await getMcpTools({ mcpUrl, protocol });

    const tools = Object.keys(mcpTools).map((key) => ({
      name: key,
      description: mcpTools[key].description,
    }));
    return {
      tools,
      status: 'success' as const,
    };
  } catch (error) {
    console.error('Error fetching MCP tools from', mcpUrl, error);
    return {
      status: 'error' as const,
      message: `Failed to fetch tools from MCP server. Check if the URL is correct and if the server is reachable.`,
    };
  }
}

export async function getMcpToolsWithToolId({
  mcpUrl,
  protocol = 'http',
}: {
  mcpUrl: string;
  protocol?: McpProtocol;
}) {
  try {
    const mcpTools = await getMcpTools({ mcpUrl, protocol });

    return Object.keys(mcpTools).reduce(
      (acc, key) => {
        acc[generateMcpToolName({ mcpUrl, name: key })] = {
          ...mcpTools[key],
          needsApproval: true,
        };
        return acc;
      },
      {} as Record<string, (typeof mcpTools)[string]>
    );
  } catch (error) {
    console.error('Error fetching MCP tools from', mcpUrl, error);
    return {};
  }
}
