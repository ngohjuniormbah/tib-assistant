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
import { Input } from '@heroui/react';
import { AnimatePresence } from 'framer-motion';
import { isEqual } from 'lodash';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { usePrevious } from 'react-use';

import ListItem from '@/components/SortableSwitchList/ListItem/ListItem';

type SortableSwitchListProps<T extends { id: string; label: string }> = {
  items: T[];
  enabledItems:
    | {
        id: string; // make a type generic so the type can be provided to this component (e.g. AssetId, AssistantId, etc.)
        config?: object; // possibly in the future, this config can even be removed and fully managed in the parent component
      }[]
    | null;
  setEnabledItems: Dispatch<
    SetStateAction<{ id: string; config?: object }[] | null>
  >;
  labelComponent: (item: T & { isEnabled: boolean }) => ReactNode;
  endContentComponent?: (item: T & { isEnabled: boolean }) => ReactNode;
};

export default function SortableSwitchList<
  T extends { id: string; label: string },
>({
  items: allItems,
  enabledItems,
  setEnabledItems,
  labelComponent,
  endContentComponent,
}: SortableSwitchListProps<T>) {
  const [filterValue, setFilterValue] = useState('');

  const [items, setItems] = useState<(T & { isEnabled: boolean })[]>([]);
  const prevItems = usePrevious(items);

  useEffect(() => {
    if (enabledItems === null) {
      return; // do not update assets if selectedAssets is not set to prevent animation when modals opens
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(() =>
      //prev
      [...allItems]
        .map((asset) => ({
          ...asset,
          isEnabled:
            enabledItems?.some((_item) => _item.id === asset.id) ?? false,
        }))
        .sort(
          (a, b) =>
            enabledItems.map(({ id }) => id).indexOf(a.id) -
            enabledItems.map(({ id }) => id).indexOf(b.id)
        )
        // ensure disabled items are at the bottom
        .sort((a, b) => Number(b.isEnabled) - Number(a.isEnabled))
    );
  }, [allItems, enabledItems, filterValue]);

  // ensure enabledItems has the same sorting as items, since enabledItems is used for saving in the parent component
  useEffect(() => {
    // not the most elegant code, but present a circular dependency
    if (isEqual(items, prevItems)) {
      return;
    }
    setEnabledItems(
      (prev) =>
        [...(prev ?? [])]?.sort((a, b) => {
          const aIndex = items.findIndex((item) => item.id === a.id);
          const bIndex = items.findIndex((item) => item.id === b.id);
          return aIndex - bIndex;
        }) ?? []
    );
  }, [items, prevItems, setEnabledItems]);

  const filteredAssets = items.filter((asset) =>
    filterValue
      ? asset.label.toLowerCase().includes(filterValue.toLowerCase())
      : true
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    if (active.id !== over.id) {
      setItems(
        arrayMove(
          items,
          items.findIndex((item) => item.id === active.id),
          items.findIndex((item) => item.id === over.id)
        ).sort((a, b) => Number(b.isEnabled) - Number(a.isEnabled))
      );
    }
  };

  return (
    <>
      <Input
        type="text"
        placeholder="Search..."
        className="w-full mb-2"
        onChange={(event) => setFilterValue(event.target.value)}
      />
      {items.length === 0 && (
        <div className="p-[6px] text-center italic">No items found</div>
      )}
      <ul className="flex flex-col gap-1">
        <AnimatePresence>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredAssets}
              strategy={verticalListSortingStrategy}
            >
              {filteredAssets.map((asset) => (
                <ListItem
                  key={asset.id}
                  id={asset.id}
                  isEnabled={asset.isEnabled}
                  setEnabledItems={setEnabledItems}
                  isSortingDisabled={!!filterValue}
                  label={labelComponent(asset)}
                  endContent={endContentComponent && endContentComponent(asset)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </AnimatePresence>
      </ul>
    </>
  );
}
