import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, TextArea } from '@heroui/react';
import { TextUIPart } from 'ai';
import { useState } from 'react';

import useLlm from '@/components/Llm/useLlm';
import ActionDropdown from '@/components/MessageBubble/ActionDropdown/ActionDropdown';
import AssistantMessage from '@/components/MessageBubble/AssistantMessage/AssistantMessage';
import { AssetId } from '@/config/assets';
import { ChatMessage } from '@/types';

type Props = {
  role: ChatMessage['role'];
  messageId: ChatMessage['id'];
  partIndex: number;
  part: TextUIPart;
  onEditMessagePart: ReturnType<typeof useLlm>['handleEditMessagePart'];
  onDeleteMessagePart: ReturnType<typeof useLlm>['handleDeleteMessagePart'];
  outputAssets: AssetId[];
};

export default function MessageBubble({
  role,
  messageId,
  partIndex,
  part,
  onEditMessagePart,
  onDeleteMessagePart,
  outputAssets,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [outputAssetOverride, setOutputAssetOverride] =
    useState<AssetId | null>(null);

  // the first output asset is the default, until another one is picked in the dropdown
  const selectedOutputAsset =
    outputAssetOverride && outputAssets.includes(outputAssetOverride)
      ? outputAssetOverride
      : (outputAssets[0] ?? null);

  const handleToggleEditing = () => {
    if (!isEditing) {
      // seed the draft with the text as it is right now, so streamed updates
      // don't have to be mirrored into state on every chunk
      setEditedText(part.text);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setIsEditing(false);
    onEditMessagePart({ messageId, partIndex, text: editedText });
  };

  const handleDelete = () => {
    if (confirm('Do you want to remove this message?'))
      onDeleteMessagePart({ messageId, partIndex });
  };

  const actionDropdown = (
    <ActionDropdown
      onEdit={handleToggleEditing}
      onDelete={handleDelete}
      outputAssets={outputAssets}
      setSelectedOutputAsset={setOutputAssetOverride}
      selectedOutputAsset={selectedOutputAsset}
    />
  );

  return (
    <div
      className={`flex my-2 max-w-[90%] relative items-center ${
        isEditing ? 'w-full' : ''
      }`}
    >
      {role === 'user' && actionDropdown}
      {isEditing ? (
        <div className="flex w-full grow items-end">
          <TextArea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={1}
            className="field-sizing-content resize-none max-h-40 w-full grow"
          />
          <Button
            variant="primary"
            size="sm"
            className="-mr-3"
            onPress={handleSave}
          >
            <FontAwesomeIcon icon={faCheck} size="lg" />
          </Button>
        </div>
      ) : (
        <>
          {role === 'user' && (
            <div className="bg-surface-tertiary py-2 px-4 rounded-3xl w-full">
              {part.text}
            </div>
          )}
          {(role === 'assistant' || role === 'system') && (
            <AssistantMessage
              part={part}
              selectedOutputAsset={selectedOutputAsset ?? undefined}
            />
          )}
        </>
      )}
      {role === 'assistant' && actionDropdown}
    </div>
  );
}
