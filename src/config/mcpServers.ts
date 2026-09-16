import { env } from 'next-runtime-env';

export type McpProtocol = 'http' | 'sse';

export type McpServer = {
  url: string;
  protocol: McpProtocol;
};

const MCP_SERVERS: McpServer[] = [
  {
    url: env('NEXT_PUBLIC_MCP_SERVER_URL')!,
    protocol: 'http',
  },
  {
    url: 'https://mcp.ask.orkg.org/sse',
    protocol: 'sse',
  },
];

export default MCP_SERVERS;
export { MCP_SERVERS };
