import { Button } from '@heroui/react';

import { ActionButton as ActionButtonType } from '@/components/TextareaLlm/TextareaLlm';

type Props = {
  button: ActionButtonType;
  handleInsertPlaceholder: (placeholder: string) => void;
  isDisabled: boolean;
};

export default function ActionButtonPlaceholder({
  button,
  handleInsertPlaceholder,
  isDisabled,
}: Props) {
  return (
    <>
      <Button
        key={button.label}
        onPress={() => handleInsertPlaceholder(button.placeholder ?? '')}
        isDisabled={isDisabled}
      >
        {button.label}
      </Button>
    </>
  );
}
