import { faArrowUp, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, TextArea } from '@heroui/react';
import { KeyboardEvent, useRef } from 'react';

import { Theme } from '@/components/EditableList/EditableList';

export default function AddItem({
  handleAdd,
  theme,
  placeholder = 'Add an item...',
}: {
  handleAdd: (item: string) => void;
  theme: Theme;
  placeholder?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }
  };
  const handleSubmit = (formData: FormData) => {
    handleAdd(formData.get('item') as string);
  };
  return (
    <li
      className={`rounded-3xl w-full block px-[8px] py-[3px] ${
        theme === 'normal' ? 'bg-surface-secondary' : ''
      } ${theme === 'darker' ? 'bg-default' : ''}`}
    >
      <form
        action={handleSubmit}
        className="flex items-center gap-2"
        ref={formRef}
      >
        <FontAwesomeIcon icon={faPlus} className="text-muted" />
        <TextArea
          rows={1}
          name="item"
          onKeyDown={handleKeyDown}
          className="field-sizing-content resize-none max-h-40 flex-1 min-w-0 border-0 hover:bg-inherit"
          placeholder={placeholder}
        />
        <Button type="submit" size="sm" isIconOnly className="-my-2">
          <FontAwesomeIcon icon={faArrowUp} size="lg" />
        </Button>
      </form>
    </li>
  );
}
