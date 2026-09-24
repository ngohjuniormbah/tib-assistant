import TOOL_GALLERY from '@/config/toolGallery';

export function generateMcpToolName({
  mcpUrl,
  name,
}: {
  mcpUrl: string;
  name: string;
}) {
  return `${mcpUrl}-${name}`.replace(/[^a-zA-Z0-9_-]/g, '');
}

export function getToolDisplayName(toolName: string): string {
  const matchedTool = Object.entries(TOOL_GALLERY)
    .flatMap(([mcpUrl, items]) => items.map((item) => ({ ...item, mcpUrl })))
    .find(
      (item) =>
        generateMcpToolName({ mcpUrl: item.mcpUrl, name: item.mcpToolName }) ===
        toolName
    );
  return matchedTool?.name ?? toolName;
}
