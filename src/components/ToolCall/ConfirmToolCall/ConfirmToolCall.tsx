import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import {
  ChatAddToolApproveResponseFunction,
  DynamicToolUIPart,
  ToolUIPart,
} from 'ai';
import Link from 'next/link';

import useLlm from '@/components/Llm/useLlm';
import {
  generateMcpToolName,
  getToolDisplayName,
} from '@/components/TextareaLlm/ConfigureToolsModal/getMcpTools/helpers';
import InputTable from '@/components/ToolCall/ToolCallInput/InputTable/InputTable';
import TOOL_GALLERY from '@/config/toolGallery';
import ROUTES from '@/constants/routes';

type Props = {
  part: ToolUIPart | DynamicToolUIPart;
  toolName: string;
  messageId: string;
  partIndex: number;
  handleEditMessagePart: ReturnType<typeof useLlm>['handleEditMessagePart'];
  addToolApprovalResponse: ChatAddToolApproveResponseFunction;
};

export function ConfirmToolCall({
  part,
  toolName,
  messageId,
  partIndex,
  handleEditMessagePart,
  addToolApprovalResponse,
}: Props) {
  const tool = Object.entries(TOOL_GALLERY)
    .flatMap(([mcpUrl, items]) => items.map((item) => ({ ...item, mcpUrl })))
    .find(
      (item) =>
        generateMcpToolName({ mcpUrl: item.mcpUrl, name: item.mcpToolName }) ===
        toolName
    );
  const hasMetadata = !!tool?.gdpr;

  const handleCancel = () => {
    if (!part?.approval) {
      return;
    }
    addToolApprovalResponse({
      id: part.approval.id,
      approved: false,
    });
  };

  const handleContinue = async () => {
    if (!part?.approval) {
      return;
    }
    addToolApprovalResponse({
      id: part.approval.id,
      approved: true,
    });
  };
  const hasInputParams = !!(part.input && Object.keys(part.input).length > 0);

  return (
    <div className="flex group">
      <div className="ml-auto flex group my-2 items-center w-full">
        <div className="ml-auto rounded-3xl px-4 py-2 whitespace-pre-wrap flex flex-col bg-surface-secondary w-full">
          <div className="w-full flex justify-end items-start font-semibold">
            <div className="flex items-center grow-0">
              <div>Confirm tool calling: {getToolDisplayName(toolName)}</div>
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="ms-2 text-muted"
              />
            </div>
          </div>

          <div className="mt-1 ">
            <hr />
            <div className="ps-2 my-3 flex flex-wrap items-center text-sm">
              <p>
                An external server will be accessed to execute the function{' '}
                <strong>{getToolDisplayName(toolName)}</strong>.{' '}
                {hasMetadata && (
                  <>
                    It is hosted at{' '}
                    <a
                      href={`https://${tool?.gdpr?.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {tool?.gdpr?.domain}
                    </a>
                    , located in {tool?.gdpr?.country}, will be accessed.
                    Description of the tool: &quot;
                    {tool?.description}&quot;.
                  </>
                )}
                Please verify that you trust this server and ensure that apart
                from publicly available bibliographic publication data no
                personal data is transmitted.{' '}
                {hasInputParams
                  ? 'The following data will be provided to the server:'
                  : ''}
              </p>
            </div>
            {hasInputParams && (
              <InputTable
                input={part.input}
                setInput={(input) => {
                  handleEditMessagePart({
                    messageId,
                    partIndex,
                    input: input as { [key: string]: string },
                  });
                }}
                isEditable
              />
            )}

            <hr className="my-3" />
            <div className="flex justify-between items-center text-sm">
              <div>
                By clicking &quot;Continue&quot;, you declare no personal data
                is provided as per our{' '}
                <Link href={ROUTES.DATA_PROTECTION} target="_blank">
                  data protection policy
                </Link>
                .
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onPress={handleCancel}>
                  Cancel
                </Button>
                <Button variant="primary" onPress={handleContinue}>
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
