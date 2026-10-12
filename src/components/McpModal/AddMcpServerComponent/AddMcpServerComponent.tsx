import { faArrowUp, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, ListBox, Select } from '@heroui/react';
import { KeyboardEvent, useRef, useState } from 'react';

import { Theme } from '@/components/EditableList/EditableList';
import { McpProtocol, McpServer } from '@/config/mcpServers';

type AddMcpServerComponentProps = {
  onAdd: (server: McpServer) => void;
  theme: Theme;
};

export default function AddMcpServerComponent({
  onAdd,
  theme,
}: AddMcpServerComponentProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [protocol, setProtocol] = useState<McpProtocol>('http');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }
  };

  const handleSubmit = (formData: FormData) => {
    const url = formData.get('url') as string;
    if (url) {
      onAdd({ url, protocol });
      formRef.current?.reset();
      setProtocol('http');
    }
  };

  return (
    <li
      className={`rounded-3xl min-w-[290px] w-full block px-[8px] py-[3px] ${
        theme === 'normal' ? 'bg-surface-secondary' : ''
      } ${theme === 'darker' ? 'bg-default' : ''}`}
    >
      <form
        action={handleSubmit}
        className="flex items-center gap-2"
        ref={formRef}
      >
        <FontAwesomeIcon icon={faPlus} className="text-muted" />
        <Input
          name="url"
          onKeyDown={handleKeyDown}
          className="field-sizing-content resize-none max-h-40 flex-1 min-w-0 border-0"
          placeholder="Add a new MCP server URL..."
        />
        <Select
          selectedKey={protocol}
          onSelectionChange={(key) => setProtocol(key as McpProtocol)}
          className="w-[120px]"
          aria-label="Protocol selection"
        >
          <Select.Trigger className="border-0">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="http" textValue="HTTP">
                HTTP
              </ListBox.Item>
              <ListBox.Item id="sse" textValue="SSE">
                SSE
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
        <Button
          type="submit"
          size="sm"
          isIconOnly
          className="-my-2"
          aria-label="Add server"
        >
          <FontAwesomeIcon icon={faArrowUp} size="lg" />
        </Button>
      </form>
    </li>
  );
}
