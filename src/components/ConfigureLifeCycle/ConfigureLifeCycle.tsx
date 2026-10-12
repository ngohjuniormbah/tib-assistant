'use client';

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  faMagnifyingGlass,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal, Tooltip, useOverlayState } from '@heroui/react';
import { isEqual } from 'lodash';
import { useState } from 'react';

import useStore from '@/components/AssetsSidebar/hooks/useStore';
import AssistantCard from '@/components/AssistantCard/AssistantCard';
import LifeCyclePresetsModal from '@/components/ConfigureLifeCycle/LifeCyclePresetsModal/LifeCyclePresetsModal';
import SortableAssistantItem from '@/components/ConfigureLifeCycle/SortableAssistantItem/SortableAssistantItem';
import SearchFilterBar from '@/components/SearchFilter/SearchFilterBar/SearchFilterBar';
import SearchFilterPagination from '@/components/SearchFilter/SearchFilterPagination/SearchFilterPagination';
import useSearchFilter, {
  nameSorts,
} from '@/components/SearchFilter/useSearchFilter';
import ASSISTANTS from '@/config/assistants';
import LIFE_CYCLES, { LifeCycleAssistants } from '@/config/lifeCycles';

function flattenAssistants(assistants?: LifeCycleAssistants): string[] {
  if (!assistants) return [];
  return assistants.flatMap((item) =>
    typeof item === 'string' ? item : item.assistants
  );
}

type ConfigureLifeCycleProps = {
  onOpenChange: () => void;
  onClose: () => void;
};

export default function ConfigureLifeCycle({
  onOpenChange,
  onClose,
}: ConfigureLifeCycleProps) {
  const presetsState = useOverlayState();

  const {
    enabledAssistants: enabledAssistantsLocalStorage,
    setEnabledAssistants: setEnabledAssistantsLocalStorage,
  } = useStore();

  const defaultAssistants = flattenAssistants(LIFE_CYCLES?.default?.assistants);

  const [enabledAssistantIds, setEnabledAssistantIds] = useState<string[]>(
    () => {
      const storedAssistants = flattenAssistants(enabledAssistantsLocalStorage);
      const initialAssistants = storedAssistants.length
        ? storedAssistants
        : defaultAssistants;
      return Array.from(new Set(initialAssistants));
    }
  );

  const allAssistants = Object.values(ASSISTANTS);

  const searchFilter = useSearchFilter<(typeof allAssistants)[number]>({
    items: allAssistants,
    getSearchText: (assistant) =>
      [assistant.metadata?.name, assistant.metadata?.description]
        .filter(Boolean)
        .join(' '),
    filters: [
      {
        key: 'domain',
        label: 'Field',
        allOptionLabel: 'All fields',
        getValue: (assistant) => assistant.metadata?.domain,
      },
      {
        key: 'lifeCyclePhase',
        label: 'Phase',
        allOptionLabel: 'All phases',
        getValue: (assistant) => assistant.metadata?.lifeCyclePhase,
      },
    ],
    sorts: nameSorts((assistant) => assistant.metadata?.name ?? assistant.id),
  });

  const handleSave = () => {
    setEnabledAssistantsLocalStorage(enabledAssistantIds);
    onClose();
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setEnabledAssistantIds((prev) =>
      arrayMove(
        prev,
        prev.findIndex((id) => id === active.id),
        prev.findIndex((id) => id === over.id)
      )
    );
  };

  const handleToggleAssistant = (id: string, isSelected: boolean) => {
    setEnabledAssistantIds((prev) => {
      if (isSelected) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      return prev.filter((assistantId) => assistantId !== id);
    });
  };

  return (
    <>
      <Modal.Backdrop isOpen onOpenChange={onOpenChange}>
        <Modal.Container placement="top">
          <Modal.Dialog className="max-w-5xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                <div className="flex items-center">
                  Configure life cycle
                  <Tooltip delay={0}>
                    <Tooltip.Trigger>
                      <Button
                        size="sm"
                        className="min-w-10 ms-2"
                        onPress={() =>
                          setEnabledAssistantIds(defaultAssistants)
                        }
                        variant="tertiary"
                        isDisabled={isEqual(
                          defaultAssistants,
                          enabledAssistantIds
                        )}
                      >
                        <FontAwesomeIcon icon={faRotateRight} />
                      </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      Reset assistants to default selection
                    </Tooltip.Content>
                  </Tooltip>
                </div>
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Life cycle</div>
                    <Button
                      size="sm"
                      variant="tertiary"
                      onPress={presetsState.open}
                    >
                      Presets
                    </Button>
                  </div>
                  {enabledAssistantIds.length === 0 && (
                    <div className="text-sm text-muted italic">
                      No assistants selected.
                    </div>
                  )}
                  <ul className="space-y-1">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={enabledAssistantIds}
                        strategy={verticalListSortingStrategy}
                      >
                        {enabledAssistantIds.map((assistantId) => (
                          <SortableAssistantItem
                            key={assistantId}
                            assistantId={assistantId}
                            label={
                              ASSISTANTS[assistantId]?.metadata?.name ??
                              assistantId
                            }
                            onRemove={() =>
                              setEnabledAssistantIds((prev) =>
                                prev.filter((id) => id !== assistantId)
                              )
                            }
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold">Assistant library</div>
                    <Button
                      size="sm"
                      variant="primary"
                      onPress={searchFilter.toggleBar}
                    >
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                      Search
                    </Button>
                  </div>
                  {searchFilter.isBarOpen && (
                    <SearchFilterBar
                      searchValue={searchFilter.searchValue}
                      onSearchChange={searchFilter.onSearchChange}
                      searchPlaceholder="Search assistants..."
                      filterControls={searchFilter.filterControls}
                      sortOptions={searchFilter.sortOptions}
                      selectedSortKey={searchFilter.selectedSortKey}
                      onSortChange={searchFilter.onSortChange}
                    />
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {searchFilter.visibleItems.map((assistant) => (
                      <AssistantCard
                        key={assistant.id}
                        assistant={assistant}
                        isSelectable
                        isSelected={enabledAssistantIds.includes(assistant.id)}
                        onSelectChange={handleToggleAssistant}
                      />
                    ))}
                  </div>
                  {searchFilter.totalCount > searchFilter.pageSize && (
                    <SearchFilterPagination
                      page={searchFilter.page}
                      totalPages={searchFilter.totalPages}
                      onPageChange={searchFilter.onPageChange}
                      pageSize={searchFilter.pageSize}
                      pageSizeOptions={searchFilter.pageSizeOptions}
                      onPageSizeChange={searchFilter.onPageSizeChange}
                      totalCount={searchFilter.totalCount}
                    />
                  )}
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="flex justify-end">
              <Button variant="primary" onPress={handleSave}>
                Save
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
      {presetsState.isOpen && (
        <LifeCyclePresetsModal
          onOpenChange={presetsState.close}
          onClose={presetsState.close}
        />
      )}
    </>
  );
}
