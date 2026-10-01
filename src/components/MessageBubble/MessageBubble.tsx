import {
  faArrowUpRightFromSquare,
  faCheck,
  faFileLines,
  faTable,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Chip, TextArea } from '@heroui/react';
import { TextUIPart } from 'ai';
import { useState } from 'react';

import useLlm from '@/components/Llm/useLlm';
import ActionDropdown from '@/components/MessageBubble/ActionDropdown/ActionDropdown';
import AssistantMessage from '@/components/MessageBubble/AssistantMessage/AssistantMessage';
import { AttachedContext } from '@/components/TextareaLlm/TextareaLlm';
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

  const selectedOutputAsset =
    outputAssetOverride && outputAssets.includes(outputAssetOverride)
      ? outputAssetOverride
      : (outputAssets[0] ?? null);

  const handleToggleEditing = () => {
    if (!isEditing) {
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

  // Parse any attached benchmark/paper card from user message
  let attachedData: AttachedContext | null = null;
  let cleanUserText = part.text;

  const match = part.text.match(/^\[ATTACHED_CONTEXT:(\{.*?\})\]\n?([\s\S]*)$/);
  if (match) {
    try {
      attachedData = JSON.parse(match[1]);
      cleanUserText = match[2];
    } catch {
      // fallback
    }
  }

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
            <div className="bg-surface-tertiary py-2.5 px-4 rounded-3xl w-full space-y-2">
              {attachedData && (
                <div className="p-3 rounded-2xl bg-surface border border-border shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FontAwesomeIcon
                        icon={
                          attachedData.type === 'benchmark'
                            ? faTable
                            : faFileLines
                        }
                        className="text-accent text-xs"
                      />
                      <span className="font-bold text-xs text-foreground truncate">
                        {attachedData.title}
                      </span>
                    </div>
                    {attachedData.id && (
                      <Chip size="sm" className="font-mono text-[10px]">
                        {attachedData.id}
                      </Chip>
                    )}
                  </div>

                  {attachedData.details && (
                    <p className="text-[11px] text-muted m-0 leading-relaxed">
                      {attachedData.details}
                    </p>
                  )}

                  {attachedData.url && (
                    <a
                      href={attachedData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-link hover:underline inline-flex items-center gap-1"
                    >
                      <span>
                        View on{' '}
                        {attachedData.type === 'benchmark' ? 'ORKG' : 'Source'}
                      </span>
                      <FontAwesomeIcon
                        icon={faArrowUpRightFromSquare}
                        className="text-[9px]"
                      />
                    </a>
                  )}
                </div>
              )}
              {cleanUserText && (
                <p className="m-0 text-sm text-foreground leading-relaxed">
                  {cleanUserText}
                </p>
              )}
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
