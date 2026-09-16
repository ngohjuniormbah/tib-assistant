import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Switch } from '@heroui/react';
import { motion } from 'framer-motion';
import { Dispatch, ReactNode, SetStateAction } from 'react';

type Props = {
  setEnabledItems: Dispatch<
    SetStateAction<{ id: string; config?: object }[] | null>
  >;
  id: string;
  isEnabled: boolean;
  isSortingDisabled: boolean;
  label: string | ReactNode;
  endContent?: ReactNode;
};

export default function ListItem({
  id,
  isEnabled,
  setEnabledItems,
  isSortingDisabled: isSortingDisabledProp,
  label,
  endContent,
}: Props) {
  const isSortingDisabled = isSortingDisabledProp || !isEnabled;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    disabled: isSortingDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(
      transform && { ...transform, scaleY: 1, x: 0 }
    ),
    transition,
    zIndex: isDragging ? 999 : 'inherit',
  };

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      style={style}
      className="block cursor-default"
    >
      <motion.div
        className="border-b-1 p-[6px] flex items-center justify-between gap-2 bg-surface"
        key={id}
        layout={!isDragging}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <div className="flex items-center gap-2">
          <FontAwesomeIcon
            {...listeners}
            icon={faBars}
            className={`ms-1 me-2 text-muted transition-opacity ${
              isSortingDisabled
                ? 'cursor-not-allowed opacity-40'
                : 'cursor-move'
            }`}
          />
          <Switch
            isSelected={isEnabled}
            onChange={(value) => {
              setEnabledItems((prev) =>
                value
                  ? [...(prev ?? []), { id }]
                  : (prev ?? []).filter((item) => item.id !== id)
              );
            }}
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              {label}
            </Switch.Content>
          </Switch>
        </div>
        {endContent}
      </motion.div>
    </li>
  );
}
