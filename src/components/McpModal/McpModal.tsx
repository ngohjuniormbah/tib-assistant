import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Modal, Tooltip } from '@heroui/react';
import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';

import useStore from '@/components/AssetsSidebar/hooks/useStore';
import EditableList from '@/components/EditableList/EditableList';
import AddMcpServerComponent from '@/components/McpModal/AddMcpServerComponent/AddMcpServerComponent';
import McpServerItem from '@/components/McpModal/McpServerItem/McpServerItem';
import MCP_SERVERS, { McpServer } from '@/config/mcpServers';

type McpModalProps = {
  onOpenChange: () => void;
  onClose: () => void;
};

export default function McpModal({ onOpenChange, onClose }: McpModalProps) {
  const [mcpServersLocal, setMcpServersLocal] = useState<McpServer[]>([]);
  const { mcpServers, setMcpServers, removeMcpServers } = useStore();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMcpServersLocal(mcpServers);
  }, [mcpServers]);

  const handleSave = () => {
    if (isEqual(mcpServersLocal, MCP_SERVERS)) {
      removeMcpServers();
    } else {
      setMcpServers(mcpServersLocal);
    }
    onClose();
  };

  return (
    <Modal.Backdrop isOpen onOpenChange={onOpenChange}>
      <Modal.Container size="lg" placement="top">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              <div className="flex items-center">
                Configure MCP servers
                <Tooltip delay={0}>
                  <Tooltip.Trigger>
                    <Button
                      size="sm"
                      className="min-w-10 ms-2"
                      onPress={() => setMcpServersLocal(MCP_SERVERS)}
                      isDisabled={isEqual(MCP_SERVERS, mcpServersLocal)}
                      variant="tertiary"
                    >
                      <FontAwesomeIcon icon={faRotateRight} />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    Reset MCP servers to default selection
                  </Tooltip.Content>
                </Tooltip>
              </div>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <Alert>
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  MCP servers can be used to access external tools.
                </Alert.Description>
              </Alert.Content>
            </Alert>
            <div className="ps-2 my-3 flex flex-wrap items-center">
              <div className="font-semibold grow">Activated MCP servers</div>
              <EditableList<McpServer>
                items={mcpServersLocal}
                handleChange={setMcpServersLocal}
                itemComponent={McpServerItem}
                addItemComponent={AddMcpServerComponent}
                itemToString={(item) => item.url}
                stringToItem={(str) => ({ url: str, protocol: 'http' })}
              />
            </div>
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
