import { faArrowUp, faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Badge,
  Button,
  Chip,
  CloseButton,
  Spinner,
  Surface,
  TextArea,
  Tooltip,
  useOverlayState,
} from '@heroui/react';
import { isEqual } from 'lodash';
import { env } from 'next-runtime-env';
import pluralize from 'pluralize';
import { Dispatch, FormEvent, SetStateAction, useRef, useState } from 'react';

import useStore from '@/components/AssetsSidebar/hooks/useStore';
import useLlm from '@/components/Llm/useLlm';
import ToolLibraryModal from '@/components/TextareaLlm/ToolLibraryModal/ToolLibraryModal';
import useTokens from '@/lib/useTokens';

export type ActionButton = {
  type: 'placeholder' | 'file';
  label: string;
  placeholder?: string;
  fileAcceptedExtensions?: string[];
  fileAllowMultiple?: boolean;
};

type TextareaLlmProps = {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  isDisabled: boolean;
  sendMessage: ReturnType<typeof useLlm>['sendMessage'];
  defaultEnabledTools?: { [mcpUrl: string]: string[] };
  assistantId: string;
};

export default function TextareaLlm({
  input,
  setInput,
  isLoading,
  isDisabled: isDisabledProp,
  sendMessage,
  defaultEnabledTools = {},
  assistantId,
}: TextareaLlmProps) {
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const formRef = useRef<HTMLFormElement | null>(null);
  const textareaRef = useRef<null | HTMLTextAreaElement>(null);
  const { hasReachedLimit, resetInHours } = useTokens();
  const isDisabled = isDisabledProp || !!hasReachedLimit;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Enter always means "send" (Shift+Enter inserts the newline), so
      // swallow it even when sending is not possible right now
      e.preventDefault();
      if (!isDisabled && !isLoading && input.trim()) {
        formRef.current?.requestSubmit();
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // a second request while one is streaming corrupts the useChat state
    // (duplicated messages and a crash in the AI SDK's makeRequest)
    if (isDisabled || isLoading || !input.trim()) {
      return;
    }
    setInput('');

    // PDF upload is currently disabled

    // PDF files cannot be processed by OpenAI, so instead send them as additional data and handle them separately in a tool calling
    // let filesArray = null;
    // if (files) {
    //   filesArray = await serializeFileListWithContent(files);
    // }

    sendMessage({
      // role: 'user',
      // content:
      //   input + (filesArray ? filesArray.map((file) => `"${file.name}"`) : ''),
      // data: filesArray,
      role: 'user',
      parts: [{ type: 'text', text: input }],
    });
    setFiles(undefined); // ensure file selectors can be used again
  };

  const removeFile = (indexToRemove: number) => {
    if (!files) {
      return;
    }
    const dataTransfer = new DataTransfer();
    Array.from(files).forEach((file, index) => {
      if (index !== indexToRemove) {
        dataTransfer.items.add(file);
      }
    });
    setFiles(dataTransfer.files);
  };

  const configureToolsModalState = useOverlayState();

  const store = useStore();

  const enabledToolsCount = Object.values(
    store.enabledTools?.[assistantId] || defaultEnabledTools
  ).reduce((sum, tools) => sum + (Array.isArray(tools) ? tools.length : 0), 0);

  const toolsLabel = `${enabledToolsCount} active ${pluralize(
    'tool',
    enabledToolsCount
  )}`;

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col px-2 sm:px-4"
        ref={formRef}
      >
        {hasReachedLimit && (
          <Alert status="warning">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                <span>
                  You have reached your daily limit of{' '}
                  <strong>{env('NEXT_PUBLIC_TOKEN_DAILY_LIMIT')} tokens</strong>
                  . Please try again in {resetInHours} hours.
                </span>
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}
        <Surface
          variant="secondary"
          className="mt-4 flex w-full flex-col gap-2 rounded-3xl border p-2 transition-colors focus-within:border-muted/50"
        >
          <TextArea
            fullWidth
            ref={textareaRef}
            value={input}
            placeholder="Type your message..."
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            className="field-sizing-content max-h-40 resize-none border-0 bg-transparent shadow-none ring-0"
          />
          {files && (
            <div className="flex gap-2">
              {Array.from(files).map((file, index) => (
                <Chip key={index}>
                  {file.name}
                  <CloseButton onPress={() => removeFile(index)} />
                </Chip>
              ))}{' '}
            </div>
          )}

          <div className="flex items-end justify-between">
            <div className="flex max-w-[calc(100%-70px)]">
              <Tooltip>
                <Tooltip.Trigger>
                  <Button
                    size="sm"
                    className="min-w-10"
                    isDisabled={isDisabled}
                    onPress={configureToolsModalState.toggle}
                    variant="tertiary"
                  >
                    <Badge.Anchor>
                      <span className="flex items-center text-sm">
                        <FontAwesomeIcon icon={faCog} className="me-2" />{' '}
                        {toolsLabel}
                      </span>
                      {store.enabledTools?.[assistantId] &&
                        !isEqual(
                          defaultEnabledTools,
                          store.enabledTools?.[assistantId]
                        ) && (
                          <Badge
                            color="accent"
                            placement="top-right"
                            size="sm"
                          />
                        )}
                    </Badge.Anchor>
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Configure active tools</Tooltip.Content>
              </Tooltip>
            </div>
            <Button
              isIconOnly
              aria-label="Send message"
              variant="primary"
              type="submit"
              className="ms-2 rounded-full"
              size="sm"
              isDisabled={isDisabled || !input.trim()}
              isPending={isLoading}
            >
              {({ isPending }) => (
                <>
                  {isPending ? (
                    <Spinner size="sm" color="current" />
                  ) : (
                    <FontAwesomeIcon icon={faArrowUp} size="lg" />
                  )}
                </>
              )}
            </Button>
          </div>
        </Surface>
      </form>

      {configureToolsModalState.isOpen && (
        <ToolLibraryModal
          onClose={configureToolsModalState.close}
          onOpenChange={configureToolsModalState.toggle}
          assistantId={assistantId}
          defaultEnabledTools={defaultEnabledTools}
        />
      )}
    </>
  );
}
