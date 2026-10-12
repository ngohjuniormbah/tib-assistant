import { getMcpToolsWithToolId } from '@/components/TextareaLlm/ConfigureToolsModal/getMcpTools/getMcpTools';
import { generateMcpToolName } from '@/components/TextareaLlm/ConfigureToolsModal/getMcpTools/helpers';
import { McpProtocol } from '@/config/mcpServers';

export type McpToolsConfig = {
  url: string;
  protocol: McpProtocol;
  enabledToolIds: string[];
};

export async function getEnabledMcpTools({
  mcpToolsConfig,
}: {
  mcpToolsConfig: McpToolsConfig[];
}) {
  const mcpTools = await Promise.all(
    mcpToolsConfig.map(async ({ url, protocol, enabledToolIds }) => {
      const allTools = await getMcpToolsWithToolId({
        mcpUrl: url,
        protocol: protocol,
      });

      const fullToolIds = enabledToolIds.map((name) =>
        generateMcpToolName({ mcpUrl: url, name })
      );

      return Object.fromEntries(
        Object.entries(allTools).filter(([toolId]) =>
          fullToolIds.includes(toolId)
        )
      );
    })
  );

  const mcpToolsObject: {
    [key: string]: Awaited<ReturnType<typeof getMcpToolsWithToolId>>[string];
  } = Object.assign({}, ...mcpTools);

  return mcpToolsObject;
}
