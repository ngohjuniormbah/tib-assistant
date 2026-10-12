import { Button, Input, Table } from '@heroui/react';
import { useState } from 'react';

import ButtonEditIcon from '@/components/ButtonEditIcon/ButtonEditIcon';

type Props = {
  input: unknown;
  setInput?: (input: unknown) => void;
  isEditable?: boolean;
};

export default function InputTable({
  input,
  setInput,
  isEditable = false,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);

  if (!input) {
    return null;
  }

  return (
    <Table>
      <Table.Content aria-label="Table with input parameters">
        <Table.Header>
          <Table.Column isRowHeader className="bg-default text-inherit h-8">
            Name
          </Table.Column>
          <Table.Column
            className={`bg-default text-inherit h-8 ${isEditable ? 'flex justify-between items-center h-9' : ''}`}
          >
            <div>Value</div>
            {isEditable && (
              <Button
                size="sm"
                variant="secondary"
                className="my-2"
                onPress={() => setIsEditing((v) => !v)}
              >
                <ButtonEditIcon isEditing={isEditing} />
              </Button>
            )}
          </Table.Column>
        </Table.Header>
        <Table.Body>
          {Object.entries(
            input as {
              [key: string]: string | string[];
            }
          ).map(([key, value]) => (
            <Table.Row key={key} id={key}>
              <Table.Cell>{key}</Table.Cell>
              <Table.Cell>
                {Array.isArray(value) && value.length > 1 ? (
                  <ul className="list-disc pl-4">
                    {value.map((val, index) => (
                      <li key={index}>{val}</li>
                    ))}
                  </ul>
                ) : !isEditing ? (
                  value
                ) : (
                  <Input
                    value={Array.isArray(value) ? value[0] : value}
                    onChange={(e) => {
                      if (!setInput) return;
                      const newValue = e.target.value;
                      setInput({
                        ...input,
                        [key]: newValue,
                      });
                    }}
                  />
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Content>
    </Table>
  );
}
