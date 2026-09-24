import { useChat } from '@ai-sdk/react';
import { toast } from '@heroui/react';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from 'ai';
import { useState } from 'react';

import useTokens from '@/lib/useTokens';
import { ChatMessage } from '@/types';

export default function useLlm({ endpoint }: { endpoint: string }) {
  const { mutateHasReachedTokenLimit, mutateUsedTokens } = useTokens();
  const [input, setInput] = useState('');

  const {
    messages,
    status,
    setMessages,
    sendMessage,
    addToolApprovalResponse,
  } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: endpoint,
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    experimental_throttle: 50,
    onError: (e) => {
      console.error(e);
      toast.danger('An error occurred', {
        description:
          e.message || 'An error occurred while processing your request.',
      });
    },
    onFinish: () => {
      mutateHasReachedTokenLimit();
      mutateUsedTokens();
    },
  });

  const handleDeleteMessagePart = ({
    messageId,
    partIndex,
  }: {
    messageId: string;
    partIndex: number;
  }) =>
    setMessages((_messages) =>
      _messages
        .map((message) =>
          message.id === messageId
            ? {
                ...message,
                parts: message.parts.filter((_, index) => index !== partIndex),
              }
            : message
        )
        // delete the message if it has no parts left
        .filter(
          (message) => !(message.id === messageId && message.parts.length === 0)
        )
    );

  const handleEditMessagePart = ({
    messageId,
    partIndex,
    text,
    input,
    output,
  }: {
    messageId: string;
    partIndex: number;
    text?: string;
    output?: string[];
    input?: { [key: string]: string };
  }) => {
    setMessages(
      // @ts-expect-error input should be typed to match the input params of the non-dynamic tools
      (_messages) =>
        _messages.map((message) =>
          message.id === messageId
            ? {
                ...message,
                parts: message.parts.map((part, index) => {
                  if (index === partIndex) {
                    return {
                      ...part,
                      ...(output && { output }),
                      ...(input && { input }),
                      ...(text && { text }),
                    };
                  }
                  return part;
                }),
              }
            : message
        )
    );
  };
  const lastMessage = messages.at(-1);
  const lastPart = lastMessage?.parts?.at(-1);
  const isAwaitingToolCallConfirmation = !!(
    lastPart &&
    'state' in lastPart &&
    lastPart.state === 'input-available'
  );

  return {
    messages,
    input,
    setInput,
    setMessages,
    handleDeleteMessagePart,
    handleEditMessagePart,
    isLoading: status === 'submitted' || status === 'streaming',
    sendMessage,
    isAwaitingToolCallConfirmation,
    addToolApprovalResponse,
  };
}
