import { ChatAddToolApproveResponseFunction } from 'ai';
import { env } from 'next-runtime-env';

import AssetsMessage from '@/components/AssetsMessage/AssetsMessage';
import useLlm from '@/components/Llm/useLlm';
import MessageBubble from '@/components/MessageBubble/MessageBubble';
import OrkgAskLookup from '@/components/OrkgAskLookup/OrkgAskLookup';
import SemanticScholarLookup from '@/components/SemanticScholarLookup/SemanticScholarLookup';
import { generateMcpToolName } from '@/components/TextareaLlm/ConfigureToolsModal/getMcpTools/helpers';
import { ToolCall } from '@/components/ToolCall/ToolCall';
import { AssetId } from '@/config/assets';
import { ChatMessage } from '@/types';

type MessageProps = {
  message: ChatMessage;
  outputAssets: AssetId[];
  handleDeleteMessagePart: ReturnType<typeof useLlm>['handleDeleteMessagePart'];
  handleEditMessagePart: ReturnType<typeof useLlm>['handleEditMessagePart'];
  addToolApprovalResponse: ChatAddToolApproveResponseFunction;
};

export default function Message({
  message,
  outputAssets,
  handleDeleteMessagePart,
  handleEditMessagePart,
  addToolApprovalResponse,
}: MessageProps) {
  if (!message.parts) {
    return null;
  }
  return (
    <>
      {message.parts.map((part, partIndex) => {
        if (
          part.type === 'dynamic-tool' &&
          part.toolName ===
            generateMcpToolName({
              mcpUrl: 'https://mcp.ask.orkg.org/sse',
              name: 'semanticIndex',
            }) &&
          part.state === 'output-available'
        ) {
          return (
            <OrkgAskLookup
              key={part.toolCallId}
              input={part.input as { query?: string }}
              output={part.output}
            />
          );
        }
        if (
          part.type === 'dynamic-tool' &&
          part.toolName ===
            generateMcpToolName({
              mcpUrl: env('NEXT_PUBLIC_MCP_SERVER_URL')!,
              name: 'semantic_scholar_search_papers_by_keywords',
            }) &&
          part.state === 'output-available'
        ) {
          return (
            <SemanticScholarLookup
              key={part.toolCallId}
              input={part.input as { keywords?: string }}
            />
          );
        }
        if (part.type === 'data-asset') {
          return (
            <AssetsMessage
              data={part.data}
              key={message.id + part.data.assetId}
            />
          );
        }
        const containsAssets = message.parts.some(
          (part) => part.type === 'data-asset'
        );
        if (part.type === 'text' && !containsAssets) {
          return (
            <div
              key={message.id}
              className={`flex flex-col group ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {(message.role === 'user' ||
                message.role === 'assistant' ||
                message.role === 'system') && (
                <MessageBubble
                  messageId={message.id}
                  partIndex={partIndex}
                  role={message.role}
                  part={part}
                  onDeleteMessagePart={handleDeleteMessagePart}
                  onEditMessagePart={handleEditMessagePart}
                  outputAssets={outputAssets}
                />
              )}
            </div>
          );
        }

        // for all remaining tools without specific generative UI components
        if ('toolCallId' in part) {
          return (
            <ToolCall
              key={part.toolCallId}
              part={part}
              handleEditMessagePart={handleEditMessagePart}
              handleDeleteMessagePart={handleDeleteMessagePart}
              messageId={message.id}
              partIndex={partIndex}
              addToolApprovalResponse={addToolApprovalResponse}
            />
          );
        }
      })}
    </>
  );
}
