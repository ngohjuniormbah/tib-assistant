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
import { Button } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { uniqueId } from 'lodash';
import {
  ComponentType,
  createElement,
  ReactNode,
  useMemo,
  useState,
} from 'react';

import ButtonEditIcon from '@/components/ButtonEditIcon/ButtonEditIcon';
import AddItem from '@/components/EditableList/AddItem/AddItem';
import ListItem from '@/components/EditableList/ListItem/ListItem';

export type Theme = 'normal' | 'darker';

type Props<T = string> = {
  items?: T[];
  handleChange: (items: T[]) => void;
  noItemsMessage?: ReactNode;
  theme?: Theme;
  itemComponent?: ComponentType<{
    isEditing: boolean;
    item: T;
    onChange: (updatedItem: T) => void;
  }>;
  type?: 'text' | 'json';
  addItemPlaceholder?: string;
  addItemComponent?: ComponentType<{
    onAdd: (item: T) => void;
    theme: Theme;
  }>;
  // For string items only - converts T to string for display/edit
  itemToString?: (item: T) => string;
  stringToItem?: (str: string) => T;
};

export default function EditableList<T = string>({
  items,
  handleChange,
  noItemsMessage,
  theme = 'normal',
  itemComponent,
  type = 'text',
  addItemPlaceholder,
  addItemComponent,
  itemToString = (item: T) => String(item),
  stringToItem = (str: string) => str as T,
}: Props<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const itemsWithId = useMemo(
    () =>
      items?.map((item) => ({
        id: uniqueId(),
        content: item,
      })) ?? [],
    [items]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    if (active.id !== over.id) {
      handleChange(
        arrayMove(
          itemsWithId.map((item) => item.content),
          itemsWithId.findIndex((item) => item.id === active.id),
          itemsWithId.findIndex((item) => item.id === over.id)
        )
      );
    }
  };

  const handleDelete = (id: string) => {
    handleChange(
      itemsWithId.filter((item) => item.id !== id).map((item) => item.content)
    );
  };

  const handleAdd = (item: T) => {
    handleChange([...(items ?? []), item]);
  };

  const handleChangeItem = ({ id, content }: { id: string; content: T }) => {
    handleChange(
      itemsWithId
        .map((item) => (item.id === id ? { ...item, content } : item))
        .map((item) => item.content)
    );
  };

  const handleChangeText = ({
    id,
    content,
  }: {
    id: string;
    content: string;
  }) => {
    handleChangeItem({ id, content: stringToItem(content) });
  };

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onPress={() => setIsEditing((v) => !v)}
      >
        <ButtonEditIcon isEditing={isEditing} />
      </Button>
      <div className="w-full" />
      <ul className="space-y-1 w-full mt-2">
        {itemsWithId.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={itemsWithId}
              strategy={verticalListSortingStrategy}
            >
              {itemsWithId.map((item, index) =>
                itemComponent ? (
                  <ListItem
                    id={item.id}
                    item={itemToString(item.content)}
                    key={index}
                    handleDelete={handleDelete}
                    isEditing={isEditing}
                    handleChangeText={handleChangeText}
                    theme={theme}
                    itemComponent={({ isEditing }) =>
                      createElement(itemComponent, {
                        isEditing,
                        item: item.content,
                        onChange: (updatedItem) =>
                          handleChangeItem({
                            id: item.id,
                            content: updatedItem,
                          }),
                      })
                    }
                  />
                ) : (
                  <ListItem
                    id={item.id}
                    item={itemToString(item.content)}
                    key={index}
                    handleDelete={handleDelete}
                    isEditing={isEditing}
                    handleChangeText={handleChangeText}
                    theme={theme}
                  />
                )
              )}
            </SortableContext>
          </DndContext>
        )}

        {type === 'text' && (
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial="collapsed"
                animate="open"
                exit="collapsed"
                transition={{ duration: 0.3 }}
                variants={{
                  open: { opacity: 1, height: 'auto' },
                  collapsed: { opacity: 0, height: 0 },
                }}
              >
                {addItemComponent ? (
                  createElement(addItemComponent, {
                    onAdd: handleAdd,
                    theme,
                  })
                ) : (
                  <AddItem
                    handleAdd={(str: string) => handleAdd(stringToItem(str))}
                    theme={theme}
                    placeholder={addItemPlaceholder}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
        {isEditing && type !== 'text' && (
          <Button
            variant="primary"
            size="sm"
            onPress={() => handleAdd(stringToItem('{}'))}
          >
            Add
          </Button>
        )}
      </ul>
      {itemsWithId.length === 0 && !isEditing && noItemsMessage}
    </>
  );
}
