'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';

type SortableAssistantItemProps = {
  assistantId: string;
  label: string;
  onRemove: () => void;
};

export default function SortableAssistantItem({
  assistantId,
  label,
  onRemove,
}: SortableAssistantItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: assistantId });

  const style = {
    transform: CSS.Transform.toString(
      transform && { ...transform, scaleY: 1, x: 0 }
    ),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-center justify-between gap-2 bg-surface-secondary rounded-lg px-2 py-1">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            {...listeners}
            icon={faBars}
            className="text-muted cursor-move"
          />
          <span className="text-sm">{label}</span>
        </div>
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          aria-label={`Remove ${label}`}
          onPress={onRemove}
        >
          <FontAwesomeIcon icon={faTimes} className="text-muted" />
        </Button>
      </div>
    </li>
  );
}
