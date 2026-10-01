import {
  faArrowUp,
  faCog,
  faTable,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
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

export type AttachedContext = {
  id?: string;
  title: string;
  type: 'benchmark' | 'paper' | 'doi' | 'topic';
  url?: string;
  details?: string;
};

type TextareaLlmProps = {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  isDisabled: boolean;
  sendMessage: ReturnType<typeof useLlm>['sendMessage'];
  defaultEnabledTools?: { [mcpUrl: string]: string[] };
  assistantId: string;
  attachedContext?: AttachedContext | null;
  setAttachedContext?: (ctx: AttachedContext | null) => void;
};

export default function TextareaLlm({
  input,
  setInput,
  isLoading,
  isDisabled: isDisabledProp,
  sendMessage,
  defaultEnabledTools = {},
  assistantId,
  attachedContext,
  setAttachedContext,
}: TextareaLlmProps) {
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const formRef = useRef<HTMLFormElement | null>(null);
  const textareaRef = useRef<null | HTMLTextAreaElement>(null);
  const { hasReachedLimit, resetInHours } = useTokens();
  const isDisabled = isDisabledProp || !!hasReachedLimit;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isDisabled && !isLoading && (input.trim() || attachedContext)) {
        formRef.current?.requestSubmit();
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isDisabled || isLoading || (!input.trim() && !attachedContext)) {
      return;
    }

    const cleanPrompt =
      input.trim() ||
      (attachedContext?.type === 'benchmark'
        ? 'Formulate 3 publication-grade hypotheses addressing benchmark plateaus.'
        : 'Analyze this input and propose publication-grade research directions.');

    let messageText = cleanPrompt;
    if (attachedContext) {
      const metadataTag = `[ATTACHED_CONTEXT:${JSON.stringify(attachedContext)}]`;
      messageText = `${metadataTag}\n${cleanPrompt}`;
    }

    setInput('');
    if (setAttachedContext) {
      setAttachedContext(null);
    }

    sendMessage({
      role: 'user',
      parts: [{ type: 'text', text: messageText }],
    });
    setFiles(undefined);
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
          {/* Visual attachment preview badge */}
          {attachedContext && (
            <div className="flex items-center gap-2 px-2 pt-1 pb-0 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface border border-border text-foreground text-xs shadow-xs max-w-full">
                <FontAwesomeIcon
                  icon={faTable}
                  className="text-accent text-xs"
                />
                <span className="font-semibold text-muted">
                  Input {attachedContext.type.toUpperCase()}:
                </span>
                <span className="font-medium text-foreground truncate max-w-xs">
                  {attachedContext.title}
                </span>
                {attachedContext.id && (
                  <span className="font-mono text-[10px] text-muted">
                    ({attachedContext.id})
                  </span>
                )}
                {setAttachedContext && (
                  <button
                    type="button"
                    onClick={() => setAttachedContext(null)}
                    className="ml-1 text-muted hover:text-foreground p-0.5"
                    aria-label="Remove input attachment"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                  </button>
                )}
              </div>
            </div>
          )}

          <TextArea
            fullWidth
            ref={textareaRef}
            value={input}
            placeholder={
              attachedContext
                ? 'Type your custom prompt (or press Enter to generate with this benchmark)...'
                : 'Type your message...'
            }
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
              isDisabled={isDisabled || (!input.trim() && !attachedContext)}
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
