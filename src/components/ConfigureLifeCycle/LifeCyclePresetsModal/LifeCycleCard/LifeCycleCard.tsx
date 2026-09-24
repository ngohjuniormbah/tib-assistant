'use client';

import {
  faInfoCircle,
  faSitemap,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, Chip, Tooltip, useOverlayState } from '@heroui/react';

import LifeCycleInfoModal from '@/components/ConfigureLifeCycle/LifeCyclePresetsModal/LifeCycleCard/LifeCycleInfoModal/LifeCycleInfoModal';
import { LifeCycleAssistants } from '@/config/lifeCycles';

export type LifeCycleCardProps = {
  lifeCycleId: string;
  metadata: {
    name: string;
    description: string;
    domain: string;
    creator: string;
  };
  assistants: LifeCycleAssistants;
  currentEnabledAssistants?: LifeCycleAssistants;
  onSelect: (assistants: LifeCycleAssistants) => void;
};

export default function LifeCycleCard({
  metadata,
  assistants,
  currentEnabledAssistants,
  onSelect,
}: LifeCycleCardProps) {
  const lifeCycleInfoModalState = useOverlayState();

  const isCurrentlySelected = () => {
    if (!currentEnabledAssistants) return false;
    return (
      JSON.stringify(assistants) === JSON.stringify(currentEnabledAssistants)
    );
  };

  return (
    <>
      <Card variant="secondary" className="transition">
        <Card.Header>
          <div className="flex items-center justify-between gap-3">
            <Tooltip delay={0} isDisabled={!isCurrentlySelected()}>
              <Tooltip.Trigger>
                <span>
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => onSelect(assistants)}
                    isDisabled={isCurrentlySelected()}
                  >
                    Select
                  </Button>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content>This preset is already selected</Tooltip.Content>
            </Tooltip>
            <Card.Title className="text-base flex-1">
              {metadata.name}
            </Card.Title>
            <Button
              size="sm"
              isIconOnly
              aria-label={`Info for ${metadata.name}`}
              variant="ghost"
              onPress={lifeCycleInfoModalState.open}
            >
              <FontAwesomeIcon
                icon={faInfoCircle}
                size="lg"
                className="text-muted"
              />
            </Button>
          </div>
        </Card.Header>

        <Card.Description>{metadata.description}</Card.Description>

        <Card.Footer className="flex flex-wrap gap-2 items-center">
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
        </Card.Footer>
      </Card>

      {lifeCycleInfoModalState.isOpen && (
        <LifeCycleInfoModal
          lifeCycleName={metadata.name}
          metadata={metadata}
          assistants={assistants}
          onClose={lifeCycleInfoModalState.close}
        />
      )}
    </>
  );
}
