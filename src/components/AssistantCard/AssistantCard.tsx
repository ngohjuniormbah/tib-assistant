'use client';

import {
  faArrowsSpin,
  faInfoCircle,
  faSitemap,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, Chip, Switch, useOverlayState } from '@heroui/react';
import Link from 'next/link';

import AssistantInfoModal from '@/components/AssistantCard/AssistantInfoModal';
import { Assistant } from '@/types';

type AssistantCardProps = {
  assistant: Assistant;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelectChange?: (id: string, selected: boolean) => void;
  isLinkEnabled?: boolean;
};

export default function AssistantCard({
  assistant,
  isSelectable,
  isSelected,
  onSelectChange,
  isLinkEnabled = false,
}: AssistantCardProps) {
  const { isOpen, open, close } = useOverlayState();
  const id = assistant.id ?? '';
  const title = assistant.metadata?.name ?? assistant.id;
  const description = assistant.metadata?.description ?? '';

  return (
    <>
      <Card variant="secondary">
        <Card.Header>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isSelectable && (
                <Switch
                  isSelected={!!isSelected}
                  onChange={(value) =>
                    onSelectChange && onSelectChange(id, value)
                  }
                >
                  <Switch.Content>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Content>
                </Switch>
              )}
              <Card.Title className="text-base mb-0">
                {isLinkEnabled ? (
                  <Link href={`/assistants/${encodeURIComponent(id)}`}>
                    {title}
                  </Link>
                ) : (
                  title
                )}
              </Card.Title>
            </div>

            <Button
              size="sm"
              isIconOnly
              aria-label={`Info for ${title}`}
              variant="ghost"
              onPress={open}
            >
              <FontAwesomeIcon
                icon={faInfoCircle}
                size="lg"
                className="text-muted"
              />
            </Button>
          </div>
        </Card.Header>

        <Card.Description>{description}</Card.Description>

        <Card.Footer className="flex flex-wrap gap-2 items-center">
          {assistant?.metadata?.lifeCyclePhase && (
            <Chip>
              <FontAwesomeIcon icon={faArrowsSpin} className="me-1" />
              {assistant.metadata.lifeCyclePhase}
            </Chip>
          )}

          {assistant?.metadata?.domain && (
            <Chip>
              <FontAwesomeIcon icon={faSitemap} className="me-1" />
              {assistant.metadata.domain}
            </Chip>
          )}

          {assistant?.metadata?.creator && (
            <Chip>
              <FontAwesomeIcon icon={faUser} className="me-1" />
              {assistant.metadata.creator}
            </Chip>
          )}
        </Card.Footer>
      </Card>
      {isOpen && (
        <AssistantInfoModal assistant={assistant} onOpenChange={close} />
      )}
    </>
  );
}
