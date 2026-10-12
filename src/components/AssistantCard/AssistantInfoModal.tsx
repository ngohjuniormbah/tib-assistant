import {
  faArrowsSpin,
  faSitemap,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip, Modal } from '@heroui/react';

import { Assistant } from '@/types';

type Props = {
  assistant: Assistant;
  onOpenChange: () => void;
};

export default function AssistantInfoModal({ assistant, onOpenChange }: Props) {
  const title = assistant.metadata?.name ?? assistant.id;
  const systemPrompt = assistant.agent?.systemPrompt ?? '';
  const model = assistant.agent?.model;
  const tools = assistant.agent?.tools
    ? Object.entries(assistant.agent.tools).flatMap(([, value]) => value)
    : [];
  const inputAssets = assistant.agent?.inputAssets ?? [];
  const outputAssets = assistant.agent?.outputAssets ?? [];

  return (
    <Modal.Backdrop isOpen onOpenChange={onOpenChange}>
      <Modal.Container placement="top">
        <Modal.Dialog className="max-w-5xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{title}</Modal.Heading>
          </Modal.Header>

          <Modal.Body>
            <div className="text-sm">{assistant.userInterface?.infoBox}</div>

            <div className="mt-2 mb-3 flex flex-wrap gap-2 items-center">
              {assistant.metadata?.lifeCyclePhase && (
                <Chip>
                  <FontAwesomeIcon icon={faArrowsSpin} className="me-1" />
                  {assistant.metadata.lifeCyclePhase}
                </Chip>
              )}

              {assistant.metadata?.domain && (
                <Chip>
                  <FontAwesomeIcon icon={faSitemap} className="me-1" />
                  {assistant.metadata.domain}
                </Chip>
              )}

              {assistant.metadata?.creator && (
                <Chip>
                  <FontAwesomeIcon icon={faUser} className="me-1" />
                  {assistant.metadata.creator}
                </Chip>
              )}
            </div>

            <div className="border rounded-lg overflow-hidden mb-3">
              <table className="min-w-full table-fixed text-sm">
                <tbody>
                  <tr className="border-b">
                    <th className="w-1/4 text-left p-3 font-semibold align-top">
                      System prompt
                    </th>
                    <td className="p-3 align-top">
                      <div className="whitespace-pre-wrap break-words">
                        {systemPrompt || '-'}
                      </div>
                    </td>
                  </tr>

                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold align-top">
                      Model
                    </th>
                    <td className="p-3 align-top">{model || '-'}</td>
                  </tr>

                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold align-top">
                      Tools
                    </th>
                    <td className="p-3 align-top">
                      {tools.length ? (
                        <div className="flex flex-wrap gap-2">
                          {tools.map((t: string) => (
                            <Chip key={t}>{t}</Chip>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm">-</div>
                      )}
                    </td>
                  </tr>

                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold align-top">
                      Input assets
                    </th>
                    <td className="p-3 align-top">
                      {inputAssets.length ? (
                        <div className="flex flex-wrap gap-2">
                          {inputAssets.map((a) => (
                            <Chip key={a}>{a}</Chip>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm">-</div>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <th className="text-left p-3 font-semibold align-top">
                      Output assets
                    </th>
                    <td className="p-3 align-top">
                      {outputAssets.length ? (
                        <div className="flex flex-wrap gap-2">
                          {outputAssets.map((a) => (
                            <Chip key={a}>{a}</Chip>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm">-</div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
