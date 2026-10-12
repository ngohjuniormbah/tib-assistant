import { convertToModelMessages, stepCountIs } from 'ai';
import { notFound, unauthorized } from 'next/navigation';
import { NextRequest } from 'next/server';

import {
  getEnabledMcpTools,
  McpToolsConfig,
} from '@/app/(layoutWithSidebar)/assistants/[assistantId]/helpers';
import ASSISTANTS from '@/config/assistants';
import { streamText } from '@/lib/llm';
import { openai } from '@/lib/openAi';
import { isAuthenticated } from '@/pocketbase/auth';
import { ChatMessage } from '@/types';

/*
 * The chat history lives in the user's browser, so OpenAI item ids in it go
 * stale (server-side items expire and don't survive key/org changes), and
 * replaying them fails with "Item with id 'rs_…' not found". Reasoning parts
 * can only be replayed by value together with their encrypted content, so
 * parts persisted without it (or from other providers) have to be dropped.
 */
const withReplayableReasoning = (messages: ChatMessage[]): ChatMessage[] =>
  messages.map((message) => ({
    ...message,
    parts: message.parts.filter(
      (part) =>
        part.type !== 'reasoning' ||
        part.providerMetadata?.openai?.reasoningEncryptedContent != null
    ),
  }));

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ assistantId: string }>;
  }
) {
  const { assistantId } = await params;
  const { messages }: { messages: ChatMessage[] } = await request.json();
  const searchParams = request.nextUrl.searchParams;
  const mcpServersParam = searchParams.get('mcpServers');

  let mcpToolsConfig: McpToolsConfig[] = [];
  if (mcpServersParam) {
    try {
      mcpToolsConfig = JSON.parse(mcpServersParam);
    } catch {
      mcpToolsConfig = [];
    }
  }

  if (!(await isAuthenticated())) {
    return unauthorized();
  }

  const assistant = ASSISTANTS[assistantId];

  if (!assistant) {
    notFound();
  }

  const mcpTools = await getEnabledMcpTools({
    mcpToolsConfig,
  });

  try {
    const stream = await streamText({
      model: openai(assistant.agent.model ?? 'gpt-5-mini'),
      system: assistant.agent.systemPrompt,
      messages: await convertToModelMessages(withReplayableReasoning(messages)),
      tools: mcpTools,
      // Don't store items at OpenAI: with browser-persisted history every
      // request must be self-contained. The provider then automatically
      // includes reasoning.encrypted_content so reasoning replays by value.
      providerOptions: { openai: { store: false } },
      // tools: {
      //   ...tools,
      //   ...(tools['pdf-upload']
      //     ? { 'pdf-upload': getGrobidUploadedPdfTool(messages) }
      //     : {}),
      // },
      stopWhen: stepCountIs(5), // Stop after 5 steps with tool calls
    });

    if (!stream) {
      return new Response('An error occurred', { status: 400 });
    }

    return stream.toUIMessageStreamResponse({ onError: errorHandler });
  } catch (e) {
    if (e instanceof Error) {
      return new Response(e.message, { status: 400 });
    }
    return new Response(String(e), { status: 400 });
  }
}

function errorHandler(error: unknown) {
  if (process.env.NODE_ENV !== 'development') {
    return '';
  }

  if (error == null) {
    return 'unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}
