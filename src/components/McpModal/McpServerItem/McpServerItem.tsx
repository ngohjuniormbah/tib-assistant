import { Input, ListBox, Select } from '@heroui/react';
import { useEffect, useState } from 'react';

import { McpProtocol, McpServer } from '@/config/mcpServers';

type McpServerItemProps = {
  isEditing: boolean;
  item: McpServer;
  onChange: (updatedItem: McpServer) => void;
};

export default function McpServerItem({
  isEditing,
  item,
  onChange,
}: McpServerItemProps) {
  const [urlValue, setUrlValue] = useState(item.url);
  const [protocolValue, setProtocolValue] = useState(item.protocol);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrlValue(item.url);
  }, [item.url]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProtocolValue(item.protocol);
  }, [item.protocol]);

  return (
    <div className="flex items-center gap-2 w-full">
      <Input
        className="resize-none max-h-40 flex-1 min-w-0 border-0"
        disabled={!isEditing}
        value={urlValue}
        onChange={(e) => setUrlValue(e.target.value)}
        onBlur={(e) =>
          onChange({ url: e.target.value, protocol: protocolValue })
        }
      />
      <Select
        selectedKey={protocolValue}
        onSelectionChange={(key) => {
          const newProtocol = key as McpProtocol;
          setProtocolValue(newProtocol);
          onChange({ url: urlValue, protocol: newProtocol });
        }}
        className="w-[120px] border-0"
        isDisabled={!isEditing}
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
    </div>
  );
}
