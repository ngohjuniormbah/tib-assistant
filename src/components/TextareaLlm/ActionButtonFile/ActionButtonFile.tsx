import { Button } from '@heroui/react';
import { ChangeEvent, Dispatch, SetStateAction, useRef } from 'react';

import { ActionButton as ActionButtonType } from '@/components/TextareaLlm/TextareaLlm';

type Props = {
  button: ActionButtonType;
  isDisabled: boolean;
  setFiles: Dispatch<SetStateAction<FileList | undefined>>;
  files: FileList | undefined;
  fileAcceptedExtensions?: string[];
  fileAllowMultiple?: boolean;
  handleInsertPlaceholder: (placeholder: string) => void;
};

export default function ActionButtonFile({
  button,
  isDisabled,
  setFiles,
  files,
  fileAcceptedExtensions,
  fileAllowMultiple = false,
  handleInsertPlaceholder,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    const dataTransfer = new DataTransfer();
    if (files) {
      // if files are already selected
      Array.from(files).forEach((file) => dataTransfer.items.add(file));
    }
    Array.from(e.target.files).forEach((file) => dataTransfer.items.add(file));
    setFiles(dataTransfer.files);
    handleInsertPlaceholder(button.placeholder ?? '');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Button
        key={button.label}
        onPress={() => fileInputRef?.current?.click()}
        isDisabled={isDisabled}
      >
        {button.label}
        {button.type === 'file' && (
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept={
              fileAcceptedExtensions ? fileAcceptedExtensions.join(',') : ''
            }
            onChange={handleFileChange}
            multiple={fileAllowMultiple}
          />
        )}
      </Button>
    </>
  );
}
