import { faCircleDown, faCircleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Spinner } from '@heroui/react';
import {
  ChatAddToolApproveResponseFunction,
  DynamicToolUIPart,
  getToolName,
  ToolUIPart,
} from 'ai';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import EditableList from '@/components/EditableList/EditableList';
import useLlm from '@/components/Llm/useLlm';
import ActionDropdown from '@/components/MessageBubble/ActionDropdown/ActionDropdown';
import { getToolDisplayName } from '@/components/TextareaLlm/ConfigureToolsModal/getMcpTools/helpers';
import { ConfirmToolCall } from '@/components/ToolCall/ConfirmToolCall/ConfirmToolCall';
import ToolCallInput from '@/components/ToolCall/ToolCallInput/ToolCallInput';

type Props = {
  messageId: string;
  partIndex: number;
  handleEditMessagePart: ReturnType<typeof useLlm>['handleEditMessagePart'];
  handleDeleteMessagePart: ReturnType<typeof useLlm>['handleDeleteMessagePart'];
  part: ToolUIPart | DynamicToolUIPart;
  addToolApprovalResponse: ChatAddToolApproveResponseFunction;
};

export function ToolCall({
  messageId,
  partIndex,
  part,
  handleEditMessagePart,
  handleDeleteMessagePart,
  addToolApprovalResponse,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const toolName =
    part.type === 'dynamic-tool' ? part.toolName : getToolName(part);
  const toolDisplayName = getToolDisplayName(toolName);

  const handleChange = (items: string[]) => {
    handleEditMessagePart({
      messageId,
      partIndex,
      output: items,
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this response?')) {
      handleDeleteMessagePart({
        messageId,
        partIndex,
      });
    }
  };

  const isLoading =
    part.state === 'input-streaming' || part.state === 'input-available';
  const isAwaitingConfirmation = part.state === 'approval-requested';

  return isAwaitingConfirmation ? (
    <ConfirmToolCall
      part={part}
      toolName={toolName}
      handleEditMessagePart={handleEditMessagePart}
      messageId={messageId}
      partIndex={partIndex}
      addToolApprovalResponse={addToolApprovalResponse}
    />
  ) : (
    <div className={`flex group`}>
      <div
        className={`ml-auto flex group my-2 items-center ${
          isExpanded ? 'w-full' : ''
        }`}
      >
        {!isExpanded && <ActionDropdown onDelete={handleDelete} />}
        <div
          className={`ml-auto rounded-3xl px-4 py-2 whitespace-pre-wrap flex flex-col bg-surface-secondary ${
            isExpanded ? 'w-full' : ''
          }`}
        >
          <div
            className={`${
              isExpanded ? 'w-full' : ''
            } flex justify-end items-start italic font-semibold ${
              !isLoading ? 'cursor-pointer' : ''
            }`}
            onClick={() => (!isLoading ? setIsExpanded(!isExpanded) : {})}
          >
            {isExpanded && (
              <div className="grow-0 mr-auto">
                <ActionDropdown onDelete={handleDelete} />
              </div>
            )}
            <div className="flex items-center grow-0">
              <div>{toolDisplayName}</div>
              {isLoading ? (
                <Spinner size="sm" className="ms-2" />
              ) : (
                <FontAwesomeIcon
                  icon={isExpanded ? faCircleDown : faCircleRight}
                  className="ms-2 text-muted"
                />
              )}
            </div>
          </div>
          {(part.state === 'output-available' ||
            part.state === 'output-denied') && (
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                  variants={{
                    open: {
                      opacity: 1,
                      width: 'auto',
                      height: 'auto',
                      x: 0,
                    },
                    collapsed: {
                      opacity: 0,
                      width: 0,
                      height: 0,
                      x: '50vw',
                    },
                  }}
                >
                  {part.state === 'output-available' && (
                    <div className="mt-1">
                      <hr />
                      <div className="ps-2 my-3 flex flex-wrap items-center">
                        <div className="font-semibold grow">Output</div>
                        {Array.isArray(part.output) ? (
                          <EditableList
                            items={part.output}
                            handleChange={handleChange}
                            theme="darker"
                          />
                        ) : (
                          <div className="text-sm">
                            {JSON.stringify(part.output)}
                          </div>
                        )}
                      </div>
                      <hr />
                      <ToolCallInput input={part.input} />
                    </div>
                  )}
                  {part.state === 'output-denied' && (
                    <Alert status="danger" className="my-1">
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Description>
                          You cancelled the tool execution, please try again and
                          click &apos;Continue&apos; button to proceed.
                        </Alert.Description>
                      </Alert.Content>
                    </Alert>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
