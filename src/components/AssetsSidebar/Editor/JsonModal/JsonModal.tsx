// eslint-disable-next-line simple-import-sort/imports
import { Button, Modal, toast } from '@heroui/react';
import { highlight, languages } from 'prismjs';
import { useEffect, useState } from 'react';
import Editor from 'react-simple-code-editor';

import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

type Props = {
  onOpenChange: () => void;
  onClose: () => void;
  onSave: (json: unknown) => void;
  json: unknown;
};

export default function JsonModal({ onOpenChange, onSave, json }: Props) {
  const [code, setCode] = useState('');
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(JSON.stringify(json, null, 2));
  }, [json]);

  const handleSave = () => {
    try {
      const parsedJson = JSON.parse(code);
      onSave(parsedJson);
      onOpenChange();
    } catch (error) {
      toast.danger('Error occurred', {
        description: 'The JSON is not valid and might contain syntax errors',
      });
      console.error(error);
    }
  };

  return (
    <Modal.Backdrop isOpen onOpenChange={onOpenChange}>
      <Modal.Container placement="top">
        <Modal.Dialog className="max-w-4xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Edit JSON</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <Editor
              value={code}
              onValueChange={(code) => setCode(code)}
              highlight={(code) => highlight(code, languages.js, 'json')}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 13,
              }}
              className="bg-surface-tertiary rounded-3xl !border-0 [&_textarea]:outline-0"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onPress={handleSave}>
              Save
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
