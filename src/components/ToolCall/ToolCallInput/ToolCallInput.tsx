import { Accordion } from '@heroui/react';

import InputTable from '@/components/ToolCall/ToolCallInput/InputTable/InputTable';

type Props = {
  input: unknown;
};

export default function ToolCallInput({ input }: Props) {
  return (
    <Accordion defaultExpandedKeys={[]}>
      <Accordion.Item id="1">
        <Accordion.Heading>
          <Accordion.Trigger className="py-2">
            Input
            <Accordion.Indicator />
          </Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <Accordion.Body className="pb-2">
            <InputTable input={input} />
          </Accordion.Body>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
