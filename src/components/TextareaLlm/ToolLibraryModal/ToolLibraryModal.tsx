'use client';

import {
  faMagnifyingGlass,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Accordion,
  Alert,
  Button,
  Modal,
  Tabs,
  Tooltip,
  useOverlayState,
} from '@heroui/react';
import { isEqual } from 'lodash';
import { useState } from 'react';
import useSWR from 'swr';

import useStore from '@/components/AssetsSidebar/hooks/useStore';
import McpModal from '@/components/McpModal/McpModal';
import SearchFilterBar from '@/components/SearchFilter/SearchFilterBar/SearchFilterBar';
import SearchFilterPagination from '@/components/SearchFilter/SearchFilterPagination/SearchFilterPagination';
import useSearchFilter, {
  nameSorts,
} from '@/components/SearchFilter/useSearchFilter';
import { getMcpToolList } from '@/components/TextareaLlm/ConfigureToolsModal/getMcpTools/getMcpTools';
import ActivatedToolsList from '@/components/TextareaLlm/ToolLibraryModal/ActivatedToolsList';
import ToolCard from '@/components/TextareaLlm/ToolLibraryModal/ToolCard';
import TOOL_GALLERY from '@/config/toolGallery';

type ToolLibraryModalProps = {
  onOpenChange: () => void;
  onClose: () => void;
  assistantId: string;
  defaultEnabledTools?: { [mcpUrl: string]: string[] };
};

export default function ToolLibraryModal({
  onOpenChange,
  onClose,
  assistantId,
  defaultEnabledTools,
}: ToolLibraryModalProps) {
  const { mcpServers, setEnabledTools, enabledTools } = useStore();

  // Initialize local state with current enabled tools, or empty object
  const [localEnabledTools, setLocalEnabledTools] = useState<{
    [mcpUrl: string]: string[];
  }>(enabledTools?.[assistantId] || defaultEnabledTools || {});

  const [selectedTab, setSelectedTab] = useState<string>('gallery');

  const mcpModalState = useOverlayState();

  const fetchMcpTools = async (
    mcpUrl: string,
    protocol: 'http' | 'sse' = 'http'
  ) => getMcpToolList({ mcpUrl, protocol });

  const { data: mcpTools } = useSWR(
    mcpServers && mcpServers.length ? [mcpServers, 'mcpTools'] : null,
    async ([servers]) => {
      const results = await Promise.all(
        servers.map((server) => fetchMcpTools(server.url, server.protocol))
      );
      return servers.reduce<{
        [mcpUrl: string]: {
          tools?: { name: string; description?: string }[];
          status: 'success' | 'error';
          message?: string;
        };
      }>((acc, server, idx) => {
        acc[server.url] = results[idx];
        return acc;
      }, {});
    }
  );

  const handleAddTool = (mcpUrl: string, toolName: string) => {
    setLocalEnabledTools((prev) => {
      const existingTools = prev[mcpUrl] || [];
      if (existingTools.includes(toolName)) {
        return prev;
      }
      return {
        ...prev,
        [mcpUrl]: [...existingTools, toolName],
      };
    });
  };

  const handleRemoveTool = (mcpUrl: string, toolName: string) => {
    setLocalEnabledTools((prev) => {
      const existingTools = prev[mcpUrl] || [];
      return {
        ...prev,
        [mcpUrl]: existingTools.filter((t) => t !== toolName),
      };
    });
  };

  const handleAddAll = (
    mcpUrl: string,
    tools: { name: string; description?: string }[]
  ) => {
    setLocalEnabledTools((prev) => {
      const existingTools = prev[mcpUrl] || [];
      const newTools = tools
        .map((t) => t.name)
        .filter((name) => !existingTools.includes(name));
      return {
        ...prev,
        [mcpUrl]: [...existingTools, ...newTools],
      };
    });
  };

  const galleryTools = Object.entries(TOOL_GALLERY).flatMap(([mcpUrl, tools]) =>
    tools.map((tool) => ({ mcpUrl, tool }))
  );

  const gallerySearchFilter = useSearchFilter<(typeof galleryTools)[number]>({
    items: galleryTools,
    getSearchText: ({ tool }) =>
      [tool.name, tool.description].filter(Boolean).join(' '),
    filters: [
      {
        key: 'domain',
        label: 'Field',
        allOptionLabel: 'All fields',
        getValue: ({ tool }) => tool.domain,
      },
    ],
    sorts: nameSorts(({ tool }) => tool.name),
  });

  const handleSave = () => {
    setEnabledTools((prev) => ({
      ...prev,
      [assistantId]: localEnabledTools,
    }));
    onClose();
  };

  const isToolAdded = (mcpUrl: string, toolName: string): boolean => {
    return localEnabledTools[mcpUrl]?.includes(toolName) || false;
  };

  return (
    <>
      <Modal.Backdrop isOpen onOpenChange={onOpenChange} isDismissable>
        <Modal.Container placement="top">
          <Modal.Dialog className="max-w-5xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                <div className="flex items-center">
                  Tool library
                  <Tooltip delay={0}>
                    <Tooltip.Trigger>
                      <Button
                        size="sm"
                        className="min-w-10 ms-2"
                        onPress={() =>
                          setLocalEnabledTools(defaultEnabledTools || {})
                        }
                        variant="tertiary"
                        isDisabled={isEqual(
                          defaultEnabledTools || {},
                          localEnabledTools
                        )}
                      >
                        <FontAwesomeIcon icon={faRotateRight} />
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      Reset tools to default selection
                    </Tooltip.Content>
                  </Tooltip>
                </div>
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                <div className="border-r pr-6">
                  <ActivatedToolsList
                    enabledTools={localEnabledTools}
                    onRemoveTool={handleRemoveTool}
                  />
                </div>

                <Tabs
                  selectedKey={selectedTab}
                  onSelectionChange={(key) => setSelectedTab(key as string)}
                  className="gap-0!"
                >
                  <Tabs.ListContainer className="gap-0!">
                    <Tabs.List
                      aria-label="Tool library tabs"
                      className="w-auto"
                    >
                      <Tabs.Tab id="gallery">
                        Tool gallery
                        <Tabs.Indicator />
                      </Tabs.Tab>
                      <Tabs.Tab id="browser" className="whitespace-nowrap">
                        MCP browser
                        <Tabs.Indicator />
                      </Tabs.Tab>
                    </Tabs.List>
                    {selectedTab === 'browser' && (
                      <div className="flex justify-between items-center absolute top-0 right-0">
                        <div />
                        <Button
                          onPress={mcpModalState.toggle}
                          variant="tertiary"
                        >
                          Manage MCP servers
                        </Button>
                      </div>
                    )}
                  </Tabs.ListContainer>
                  <Tabs.Panel id="gallery">
                    <div className="flex justify-end mt-4">
                      <Button
                        size="sm"
                        variant="primary"
                        onPress={gallerySearchFilter.toggleBar}
                      >
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        Search
                      </Button>
                    </div>
                    {gallerySearchFilter.isBarOpen && (
                      <div className="mt-3">
                        <SearchFilterBar
                          searchValue={gallerySearchFilter.searchValue}
                          onSearchChange={gallerySearchFilter.onSearchChange}
                          searchPlaceholder="Search tools..."
                          filterControls={gallerySearchFilter.filterControls}
                          sortOptions={gallerySearchFilter.sortOptions}
                          selectedSortKey={gallerySearchFilter.selectedSortKey}
                          onSortChange={gallerySearchFilter.onSortChange}
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {gallerySearchFilter.visibleItems.map(
                        ({ mcpUrl, tool }) => (
                          <ToolCard
                            key={`${mcpUrl}-${tool.mcpToolName}`}
                            tool={tool}
                            mcpUrl={mcpUrl}
                            isAdded={isToolAdded(mcpUrl, tool.mcpToolName)}
                            onAdd={handleAddTool}
                            shouldShowMcpUrl
                          />
                        )
                      )}
                    </div>
                    {gallerySearchFilter.totalCount >
                      gallerySearchFilter.pageSize && (
                      <div className="mt-4">
                        <SearchFilterPagination
                          page={gallerySearchFilter.page}
                          totalPages={gallerySearchFilter.totalPages}
                          onPageChange={gallerySearchFilter.onPageChange}
                          pageSize={gallerySearchFilter.pageSize}
                          pageSizeOptions={gallerySearchFilter.pageSizeOptions}
                          onPageSizeChange={
                            gallerySearchFilter.onPageSizeChange
                          }
                          totalCount={gallerySearchFilter.totalCount}
                        />
                      </div>
                    )}
                  </Tabs.Panel>
                  <Tabs.Panel id="browser">
                    <div className="mt-4">
                      {(!mcpServers || mcpServers.length === 0) && (
                        <Alert>
                          <Alert.Indicator />
                          <Alert.Content>
                            <Alert.Title>No MCP servers configured</Alert.Title>
                            <Alert.Description>
                              Click &quot;Manage MCP servers&quot; to add
                              servers.
                            </Alert.Description>
                          </Alert.Content>
                        </Alert>
                      )}

                      {mcpServers && mcpServers.length > 0 && (
                        <Accordion>
                          {Object.keys(mcpTools ?? {}).map((mcpServerUrl) => {
                            const serverData = mcpTools?.[mcpServerUrl];
                            if (!serverData) return null;

                            return (
                              <Accordion.Item
                                key={mcpServerUrl}
                                id={mcpServerUrl}
                                aria-label="MCP server"
                              >
                                <Accordion.Heading>
                                  <Accordion.Trigger>
                                    <span>
                                      MCP server{' '}
                                      <span className="italic">
                                        {mcpServerUrl}
                                      </span>
                                    </span>
                                    <Accordion.Indicator />
                                  </Accordion.Trigger>
                                </Accordion.Heading>
                                <Accordion.Panel>
                                  <Accordion.Body>
                                    {serverData.status === 'success' &&
                                      serverData.tools && (
                                        <>
                                          <div className="flex justify-end mb-1 -mt-4">
                                            <Button
                                              size="sm"
                                              variant="tertiary"
                                              onPress={() =>
                                                handleAddAll(
                                                  mcpServerUrl,
                                                  serverData.tools!
                                                )
                                              }
                                            >
                                              + Add all
                                            </Button>
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {serverData.tools.map((tool) => (
                                              <ToolCard
                                                key={`${mcpServerUrl}-${tool.name}`}
                                                tool={{
                                                  mcpToolName: tool.name,
                                                  name: tool.name,
                                                  description:
                                                    tool.description ??
                                                    'No description available',
                                                }}
                                                mcpUrl={mcpServerUrl}
                                                isAdded={isToolAdded(
                                                  mcpServerUrl,
                                                  tool.name
                                                )}
                                                onAdd={handleAddTool}
                                              />
                                            ))}
                                          </div>
                                        </>
                                      )}

                                    {serverData.status === 'error' && (
                                      <Alert status="danger">
                                        <Alert.Indicator />
                                        <Alert.Content>
                                          <Alert.Description>
                                            {serverData.message}
                                          </Alert.Description>
                                        </Alert.Content>
                                      </Alert>
                                    )}
                                  </Accordion.Body>
                                </Accordion.Panel>
                              </Accordion.Item>
                            );
                          })}
                        </Accordion>
                      )}
                    </div>
                  </Tabs.Panel>
                </Tabs>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onPress={handleSave}>
                Save
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      {mcpModalState.isOpen && (
        <McpModal
          onClose={mcpModalState.close}
          onOpenChange={mcpModalState.toggle}
        />
      )}
    </>
  );
}
