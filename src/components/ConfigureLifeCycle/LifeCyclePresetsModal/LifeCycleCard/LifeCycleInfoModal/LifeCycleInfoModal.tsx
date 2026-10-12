'use client';

import { faSitemap, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip, Modal } from '@heroui/react';

import ASSISTANTS from '@/config/assistants';
import { LifeCycleAssistants } from '@/config/lifeCycles';

type LifeCycleInfoModalProps = {
  lifeCycleName: string;
  metadata: {
    name: string;
    description: string;
    domain: string;
    creator: string;
  };
  assistants: LifeCycleAssistants;
  onClose: () => void;
};

export default function LifeCycleInfoModal({
  lifeCycleName,
  metadata,
  assistants,
  onClose,
}: LifeCycleInfoModalProps) {
  const getAssistantName = (id: string) => {
    return ASSISTANTS[id]?.metadata?.name || id;
  };

  const renderAssistantsList = () => {
    return assistants.map((item, index) => {
      if (typeof item === 'string') {
        return <li key={index}>{getAssistantName(item)}</li>;
      } else {
        return (
          <li key={index}>
            {item.groupName}
            <ol className="ml-4 mt-1 list-disc list-inside">
              {item.assistants.map((assistantId, subIndex) => (
                <li key={subIndex}>{getAssistantName(assistantId)}</li>
              ))}
            </ol>
          </li>
        );
      }
    });
  };

  return (
    <Modal.Backdrop isOpen onOpenChange={onClose}>
      <Modal.Container placement="top">
        <Modal.Dialog className="max-w-3xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{lifeCycleName}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <div className="text-sm">{metadata.description}</div>

            <div className="flex flex-wrap gap-2 items-center mb-4">
              {metadata.domain && (
                <Chip>
                  <FontAwesomeIcon icon={faSitemap} className="me-1" />
                  {metadata.domain}
                </Chip>
              )}

              {metadata.creator && (
                <Chip>
                  <FontAwesomeIcon icon={faUser} className="me-1" />
                  {metadata.creator}
                </Chip>
              )}
            </div>

            <div className="border rounded-lg overflow-hidden mb-3">
              <table className="min-w-full table-fixed text-sm">
                <tbody>
                  <tr>
                    <th className="w-1/4 text-left p-3 font-semibold align-top">
                      Assistants
                    </th>
                    <td className="p-3 align-top">
                      <ul className="space-y-1 list-disc list-inside">
                        {renderAssistantsList()}
                      </ul>
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
