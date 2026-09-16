import {
  faInfoCircle,
  faLightbulb,
  faRotateLeft,
  faSearch,
  faTable,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Button,
  ScrollShadow,
  Tooltip,
  useOverlayState,
} from '@heroui/react';
import { generateId } from 'ai';
import dynamic from 'next/dynamic';
import { ReactNode, useCallback, useContext, useEffect } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';

import AssetsContext from '@/components/AssetsProvider/assetsContext';
import AssetsSelectionPopover from '@/components/AssetsSelectionPopover/AssetsSelectionPopover';
import useStore from '@/components/AssetsSidebar/hooks/useStore';
import AssistantInfoModal from '@/components/AssistantCard/AssistantInfoModal';
import IdeationStarterModal from '@/components/IdeationStarterModal/IdeationStarterModal';
import IdeationWelcomeHero from '@/components/IdeationWelcomeHero/IdeationWelcomeHero';
import ImportComparisonModal from '@/components/ImportComparisonModal/ImportComparisonModal';
import Message from '@/components/Llm/Message/Message';
import useLlm from '@/components/Llm/useLlm';
import OrkgNlQueryModal from '@/components/OrkgNlQueryModal/OrkgNlQueryModal';
import sidebarsContext from '@/components/SidebarsProvider/sidebarsContext';
import useIndexedDbStore from '@/components/useIndexedDbStore/useIndexedDbStore';
import useIndexedDbStores from '@/components/useIndexedDbStores/useIndexedDbStores';
import { AssetId } from '@/config/assets';
import ASSISTANTS from '@/config/assistants';
import getAssetById from '@/lib/getAssetById';
import { OrkgComparisonResult } from '@/services/orkgComparison';
import { ChatMessage } from '@/types';

const TextareaLlm = dynamic(
  () => import('@/components/TextareaLlm/TextareaLlm'),
  {
    ssr: false,
  }
);

type LlmProps = {
  endpoint: string;
  isDisabled?: boolean;
  initialAssets?: string[];
  initialSystemMessage?: string;
  outputAssets: string[];
  defaultEnabledTools?: { [mcpUrl: string]: string[] };
  assistantId: string;
  infoBox?: ReactNode;
};

export default function Llm({
  endpoint,
  defaultEnabledTools,
  isDisabled = false,
  initialAssets,
  outputAssets,
  initialSystemMessage,
  assistantId,
  infoBox,
}: LlmProps) {
  const { assets, setAssets } = useContext(AssetsContext);
  const { isCompactViewport } = useContext(sidebarsContext);

  const {
    isOpen: isInfoModalOpen,
    open: openInfoModal,
    close: closeInfoModal,
  } = useOverlayState();

  const importComparisonModalState = useOverlayState();
  const nlQueryModalState = useOverlayState();
  const ideationStarterModalState = useOverlayState();

  const {
    enabledTools: enabledToolsLocalStorage,
    chatMessages,
    setChatMessages,
    mcpServers,
  } = useStore();

  const { update: updateComparisonMatrix } = useIndexedDbStore({
    assetId: 'comparisonMatrix',
  });

  const { asset: bibliographyAsset, update: updateBibliography } =
    useIndexedDbStore({
      assetId: 'bibliography',
    });

  const initialAssetsContent = useIndexedDbStores({ assetIds: initialAssets });

  const enabledToolsMap =
    enabledToolsLocalStorage?.[assistantId] ?? defaultEnabledTools ?? {};

  const mcpServersConfig = mcpServers.map((server) => ({
    url: server.url,
    protocol: server.protocol,
    enabledToolIds: enabledToolsMap[server.url] ?? [],
  }));

  const {
    messages,
    input,
    setInput,
    setMessages,
    handleDeleteMessagePart,
    handleEditMessagePart,
    isLoading,
    sendMessage,
    isAwaitingToolCallConfirmation,
    addToolApprovalResponse,
  } = useLlm({
    endpoint: `${endpoint}?mcpServers=${encodeURIComponent(JSON.stringify(mcpServersConfig))}`,
  });

  useEffect(() => {
    if (messages.length === 0 || isLoading) {
      return;
    }
    setChatMessages((prev) => ({
      ...prev,
      [assistantId]: messages,
    }));
  }, [assistantId, isLoading, messages, setChatMessages]);

  const { scrollRef: messagesContainerRef, contentRef: messagesContentRef } =
    useStickToBottom({ initial: 'instant', resize: 'smooth' });

  const assetToString = ({
    assetId,
    content,
  }: {
    assetId: AssetId;
    content: string[];
  }) => {
    const asset = getAssetById(assetId);
    return `${asset ? asset.name : assetId}: ${content.join(', ')}`;
  };

  const serializeAssets = useCallback(
    (_assets: AssetId[]) =>
      _assets
        .map((asset, index) =>
          assetToString({
            assetId: asset,
            content: initialAssetsContent?.[index] ?? [],
          })
        )
        .join('\n'),
    [initialAssetsContent]
  );

  useEffect(() => {
    if (assets.length > 0) {
      sendMessage({
        id: generateId(),
        role: 'user',
        parts: [
          {
            type: 'text',
            text: assets
              .map((asset) =>
                assetToString({
                  assetId: asset.assetId,
                  content: asset.content,
                })
              )
              .join('\n'),
          },
          ...assets.map((asset) => ({
            type: 'data-asset' as const,
            data: {
              assetId: asset.assetId,
              content: asset.content ?? [],
            },
          })),
        ],
      });
      setAssets([]);
    }
  }, [sendMessage, assets, setAssets]);

  useEffect(() => {
    if (messages.length < 2 && initialAssets) {
      const content = serializeAssets(initialAssets);

      if (
        !content ||
        messages?.[0]?.parts?.find(
          (part) => 'text' in part && part.text === content
        )
      ) {
        return;
      }

      setMessages([
        {
          id: generateId(),
          role: 'user',
          parts: [
            {
              type: 'text',
              text: content,
            },
            ...initialAssets.map((assetId, index) => ({
              type: 'data-asset' as const,
              data: {
                assetId,
                content: initialAssetsContent?.[index] ?? [],
              },
            })),
          ],
        },
      ]);
    }
  }, [
    initialAssets,
    initialAssetsContent,
    messages,
    sendMessage,
    serializeAssets,
    setMessages,
  ]);

  useEffect(() => {
    if (messages.length === 0) {
      const _messages: ChatMessage[] = [];

      if (chatMessages[assistantId] && chatMessages[assistantId].length > 0) {
        const seenMessageIds = new Set<string>();
        _messages.push(
          ...chatMessages[assistantId].filter((message) => {
            if (seenMessageIds.has(message.id)) {
              return false;
            }
            seenMessageIds.add(message.id);
            return true;
          })
        );
      } else if (initialSystemMessage && assistantId !== 'ideation') {
        _messages.push({
          id: Date.now().toString(),
          role: 'system',
          parts: [
            {
              type: 'text',
              text: initialSystemMessage ?? '',
            },
          ],
        });
      }
      if (_messages.length > 0) {
        setMessages(_messages);
      }
    }
  }, [messages, setMessages, initialSystemMessage, chatMessages, assistantId]);

  const handleClearMessages = () => {
    if (confirm('Are you sure you want to clear all messages?')) {
      setMessages([]);
      setChatMessages((prev) => ({
        ...prev,
        [assistantId]: [],
      }));
    }
  };

  const handleImportComparison = async (results: OrkgComparisonResult[]) => {
    if (!results.length) return;

    await updateComparisonMatrix(results.map((r) => r.markdownTable));

    const newBibEntries = results.flatMap((result) =>
      result.contributions.map((c) =>
        JSON.stringify({
          id: `orkg-${c.id}`,
          title: c.name,
          type: 'article-journal',
          DOI: c.doi || undefined,
          issued: c.year ? { 'date-parts': [[c.year]] } : undefined,
          abstract: c.formattedSummary,
        })
      )
    );
    const existingBib = bibliographyAsset ?? [];
    const mergedBib = Array.from(new Set([...existingBib, ...newBibEntries]));
    await updateBibliography(mergedBib);

    const totalStudies = results.reduce((sum, r) => sum + r.contributionCount, 0);
    const titlesSummary = results
      .map((r) => `- **${r.title}** (${r.contributionCount} studies, ${r.propertyColumns.length} properties)`)
      .join('\n');

    const tablesMarkdown = results
      .map((r) => `### ${r.title}\n\n${r.markdownTable}`)
      .join('\n\n---\n\n');

    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: `Imported ${results.length} ORKG Comparison Table${results.length > 1 ? 's' : ''} (${totalStudies} total studies):\n\n${titlesSummary}\n\n---\n\n${tablesMarkdown}\n\n---\nComparison matrix asset and bibliography updated with all tables. Enter your prompt below to synthesize the literature review across these studies without external search.`,
          },
        ],
      },
    ]);

    setInput(
      `Provide an exhaustive, structured literature review synthesizing all ${results.length} imported comparison tables (${totalStudies} studies in total), comparing their extraction metrics, approaches, and conclusions. Do not call external tools.`
    );
  };

  const handleOrkgNlQuery = (query: string, nlResponse: string, _sparqlQuery: string) => {
    setMessages([
      ...messages,
      {
        id: generateId(),
        role: 'user',
        parts: [{ type: 'text', text: `🔍 ORKG Query: ${query}` }],
      },
      {
        id: generateId(),
        role: 'assistant',
        parts: [{ type: 'text', text: nlResponse }],
      },
    ]);
  };

  const initialAssetsWithoutContent =
    initialAssets?.filter((_, index) => {
      const content = initialAssetsContent?.[index];
      return !content || content.length === 0;
    }) ?? [];

  const hasMissingAssets = initialAssetsWithoutContent.length > 0;
  const assistant = ASSISTANTS[assistantId];

  const infoAlert = infoBox && assistantId !== 'ideation' ? (
    <Alert>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Description>
          <p>{infoBox}</p>
        </Alert.Description>
      </Alert.Content>
    </Alert>
  ) : null;

  return (
    <div className="box-white grow flex-1 !px-0 flex flex-col py-2 rounded overflow-hidden h-full">
      <div className="px-3 sm:px-6">
        <div className="flex items-center mb-2 justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl m-0">{assistant?.metadata.name}</h1>
            <div className="flex gap-1">
              <Tooltip delay={0}>
                <Tooltip.Trigger>
                  <Button
                    isIconOnly
                    size="sm"
                    onPress={handleClearMessages}
                    isDisabled={messages.length === 0}
                    variant="tertiary"
                  >
                    <FontAwesomeIcon icon={faRotateLeft} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Clear chat</Tooltip.Content>
              </Tooltip>

              <Tooltip delay={0}>
                <Tooltip.Trigger>
                  <Button
                    isIconOnly
                    size="sm"
                    onPress={openInfoModal}
                    isDisabled={!assistant}
                    variant="tertiary"
                    aria-label={`Info for ${assistant?.metadata.name ?? assistantId}`}
                  >
                    <FontAwesomeIcon icon={faInfoCircle} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Assistant info</Tooltip.Content>
              </Tooltip>
            </div>
          </div>

          {assistantId === 'ideation' && (
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="primary"
                onPress={ideationStarterModalState.open}
                className="gap-2"
              >
                <FontAwesomeIcon icon={faLightbulb} />
                <span className="hidden sm:inline">Research Starters</span>
              </Button>
            </div>
          )}

          {(assistantId === 'relatedLiterature' ||
            assistantId === 'paperRelatedWork') && (
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="secondary" onPress={nlQueryModalState.open} className="gap-2">
                <FontAwesomeIcon icon={faSearch} />
                <span className="hidden sm:inline">Query ORKG</span>
              </Button>
              <Button size="sm" variant="primary" onPress={importComparisonModalState.open} className="gap-2">
                <FontAwesomeIcon icon={faTable} />
                <span className="hidden sm:inline">Import ORKG comparison</span>
              </Button>
            </div>
          )}
        </div>
        {!isCompactViewport && infoAlert}
      </div>

      {hasMissingAssets && (
        <div className="mx-3 sm:mx-6">
          <Alert status="danger" className="my-2">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                <p>
                  To start using this assistant, you first need to provide{' '}
                  <strong>
                    {initialAssetsWithoutContent
                      .map((assetId) => getAssetById(assetId)?.name ?? assetId)
                      .join(', ')}
                  </strong>
                  . Use the Assets panel to add them.
                </p>
              </Alert.Description>
            </Alert.Content>
          </Alert>
        </div>
      )}

      <ScrollShadow
        className="w-full mb-4 overflow-y-scroll overflow-x-hidden transition-[flex-grow] ease-in-out h-full px-3 sm:px-6 pt-3"
        ref={messagesContainerRef}
        offset={5}
        visibility="none"
      >
        <div className="flex flex-col" ref={messagesContentRef}>
          {isCompactViewport && infoAlert && (
            <div className="mb-3 shrink-0">{infoAlert}</div>
          )}

          {assistantId === 'ideation' && messages.length === 0 && (
            <IdeationWelcomeHero />
          )}

          {messages.map((message) => (
            <Message
              handleDeleteMessagePart={handleDeleteMessagePart}
              handleEditMessagePart={handleEditMessagePart}
              key={message.id}
              message={message}
              outputAssets={outputAssets}
              addToolApprovalResponse={addToolApprovalResponse}
            />
          ))}
        </div>
      </ScrollShadow>

      <TextareaLlm
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        defaultEnabledTools={defaultEnabledTools}
        assistantId={assistantId}
        isDisabled={
          hasMissingAssets || isDisabled || isAwaitingToolCallConfirmation
        }
        sendMessage={sendMessage}
      />

      <AssetsSelectionPopover
        outputAssets={outputAssets}
        containerRef={messagesContainerRef}
      />

      {isInfoModalOpen && assistant && (
        <AssistantInfoModal
          assistant={assistant}
          onOpenChange={closeInfoModal}
        />
      )}

      {importComparisonModalState.isOpen && (
        <ImportComparisonModal
          isOpen={importComparisonModalState.isOpen}
          onOpenChange={importComparisonModalState.setOpen}
          onImport={handleImportComparison}
        />
      )}

      {nlQueryModalState.isOpen && (
        <OrkgNlQueryModal
          isOpen={nlQueryModalState.isOpen}
          onOpenChange={nlQueryModalState.setOpen}
          onQueryComplete={handleOrkgNlQuery}
        />
      )}

      {ideationStarterModalState.isOpen && (
        <IdeationStarterModal
          isOpen={ideationStarterModalState.isOpen}
          onOpenChange={ideationStarterModalState.setOpen}
          onSelectStarter={(prompt) => {
            setInput(prompt);
            ideationStarterModalState.close();
          }}
        />
      )}
    </div>
  );
}
