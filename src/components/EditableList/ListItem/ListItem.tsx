'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, TextArea } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';

import { Theme } from '@/components/EditableList/EditableList';

export default function ListItem({
  id,
  item,
  handleDelete,
  handleChangeText,
  isEditing,
  theme,
  itemComponent,
}: {
  id: string;
  item: string;
  handleDelete: (item: string) => void;
  handleChangeText: ({ id, content }: { id: string; content: string }) => void;
  isEditing: boolean;
  theme: Theme;
  itemComponent?: ({
    isEditing,
    item,
  }: {
    isEditing: boolean;
    item: string;
  }) => ReactNode;
}) {
  const [value, setValue] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(item);
  }, [item]);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(
      transform && { ...transform, scaleY: 1, x: 0 }
    ),
    transition,
    cursor: 'default',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <li
      className={`rounded-3xl w-full block px-[8px] py-[3px] ${
        theme === 'normal' ? 'bg-surface-secondary' : ''
      } ${theme === 'darker' ? 'bg-default' : ''}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <div className="grow flex items-center">
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial="collapsed"
              animate="open"
              exit="collapsed"
              transition={{ duration: 0.3 }}
              variants={{
                open: { opacity: 1, width: 'auto', x: 0 },
                collapsed: { opacity: 0, width: 0, x: -20 },
              }}
            >
              <FontAwesomeIcon
                {...listeners}
                icon={faBars}
                className="ms-1 me-2 text-muted"
                style={{ cursor: 'move' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {!itemComponent && (
          <TextArea
            rows={1}
            className="field-sizing-content resize-none max-h-40 flex-1 min-w-0 border-0 hover:bg-inherit"
            disabled={!isEditing}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={(e) => handleChangeText({ id, content: e.target.value })}
          />
        )}
        {itemComponent && itemComponent({ item, isEditing })}
      </div>
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial="collapsed"
            animate="open"
            exit="collapsed"
            transition={{ duration: 0.3 }}
            variants={{
              open: { opacity: 1, width: 'auto' },
              collapsed: { opacity: 0, width: 0 },
            }}
          >
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              className="py-0 px-1 lh-1"
              onPress={() => handleDelete(id)}
              aria-label="item"
            >
              <FontAwesomeIcon
                icon={faTimes}
                className="text-muted"
                size="lg"
              />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
