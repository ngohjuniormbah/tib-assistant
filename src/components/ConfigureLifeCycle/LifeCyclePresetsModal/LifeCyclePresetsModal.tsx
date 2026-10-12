'use client';

import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal, toast } from '@heroui/react';

import useStore from '@/components/AssetsSidebar/hooks/useStore';
import LifeCycleCard from '@/components/ConfigureLifeCycle/LifeCyclePresetsModal/LifeCycleCard/LifeCycleCard';
import SearchFilterBar from '@/components/SearchFilter/SearchFilterBar/SearchFilterBar';
import SearchFilterPagination from '@/components/SearchFilter/SearchFilterPagination/SearchFilterPagination';
import useSearchFilter, {
  nameSorts,
} from '@/components/SearchFilter/useSearchFilter';
import LIFE_CYCLES from '@/config/lifeCycles';
import { LifeCycleAssistants } from '@/config/lifeCycles';

type LifeCyclePresetsModalProps = {
  onOpenChange: () => void;
  onClose: () => void;
};

export default function LifeCyclePresetsModal({
  onOpenChange,
  onClose,
}: LifeCyclePresetsModalProps) {
  const { enabledAssistants, setEnabledAssistants } = useStore();

  const lifeCyclePresets = Object.entries(LIFE_CYCLES).map(
    ([lifeCycleId, lifeCycle]) => ({ id: lifeCycleId, ...lifeCycle })
  );

  type LifeCyclePreset = (typeof lifeCyclePresets)[number];

  const presetSearchFilter = useSearchFilter<LifeCyclePreset>({
    items: lifeCyclePresets,
    getSearchText: (preset) =>
      [preset.metadata.name, preset.metadata.description]
        .filter(Boolean)
        .join(' '),
    filters: [
      {
        key: 'domain',
        label: 'Field',
        allOptionLabel: 'All fields',
        getValue: (preset) => preset.metadata.domain,
      },
    ],
    sorts: nameSorts((preset) => preset.metadata.name),
  });

  const handleSelect = (assistants: LifeCycleAssistants) => {
    setEnabledAssistants(assistants);
    onClose();
    toast.success('Preset loaded', {
      description: 'The life cycle preset has been applied.',
    });
  };

  return (
    <Modal.Backdrop isOpen onOpenChange={onOpenChange}>
      <Modal.Container placement="top">
        <Modal.Dialog className="max-w-4xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Life cycle presets</Modal.Heading>
          </Modal.Header>

          <Modal.Body>
            <div className="flex flex-col gap-3">
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="primary"
                  onPress={presetSearchFilter.toggleBar}
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                  Search
                </Button>
              </div>
              {presetSearchFilter.isBarOpen && (
                <SearchFilterBar
                  searchValue={presetSearchFilter.searchValue}
                  onSearchChange={presetSearchFilter.onSearchChange}
                  searchPlaceholder="Search pipelines..."
                  filterControls={presetSearchFilter.filterControls}
                  sortOptions={presetSearchFilter.sortOptions}
                  selectedSortKey={presetSearchFilter.selectedSortKey}
                  onSortChange={presetSearchFilter.onSortChange}
                />
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
                {presetSearchFilter.visibleItems.map((preset) => (
                  <LifeCycleCard
                    key={preset.id}
                    lifeCycleId={preset.id}
                    metadata={preset.metadata}
                    assistants={preset.assistants}
                    currentEnabledAssistants={enabledAssistants}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
              {presetSearchFilter.totalCount > presetSearchFilter.pageSize && (
                <SearchFilterPagination
                  page={presetSearchFilter.page}
                  totalPages={presetSearchFilter.totalPages}
                  onPageChange={presetSearchFilter.onPageChange}
                  pageSize={presetSearchFilter.pageSize}
                  pageSizeOptions={presetSearchFilter.pageSizeOptions}
                  onPageSizeChange={presetSearchFilter.onPageSizeChange}
                  totalCount={presetSearchFilter.totalCount}
                />
              )}
            </div>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
