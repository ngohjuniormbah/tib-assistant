'use client';

import { faPlus, faSitemap, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, Chip } from '@heroui/react';

import { ToolGalleryItem } from '@/config/toolGallery';

type Props = {
  tool: ToolGalleryItem;
  mcpUrl: string;
  isAdded: boolean;
  onAdd: (mcpUrl: string, toolName: string) => void;
  shouldShowMcpUrl?: boolean;
};

export default function ToolCard({
  tool,
  mcpUrl,
  isAdded,
  onAdd,
  shouldShowMcpUrl = false,
}: Props) {
  return (
    <Card variant="secondary" className="transition">
      <Card.Header>
        <div className="flex items-start gap-3">
          <Button
            size="sm"
            isIconOnly
            aria-label={`Add ${tool.name}`}
            variant="tertiary"
            onPress={() => onAdd(mcpUrl, tool.mcpToolName)}
            isDisabled={isAdded}
            className="shrink-0"
          >
            <FontAwesomeIcon icon={faPlus} size="sm" />
          </Button>
          <div className="flex flex-col min-w-0">
            <Card.Title
              className="text-base flex-1 truncate max-w-full mb-0"
              title={tool.name}
            >
              {tool.name}
            </Card.Title>
            {shouldShowMcpUrl && (
              <span className="text-sm flex-1 text-muted truncate max-w-full">
                {mcpUrl}
              </span>
            )}
          </div>
        </div>
      </Card.Header>

      <Card.Description>{tool.description}</Card.Description>

      <Card.Footer className="flex flex-wrap gap-2 items-center">
        {tool.domain && (
          <Chip>
            <FontAwesomeIcon icon={faSitemap} className="me-1" />
            {tool.domain}
          </Chip>
        )}

        {tool.creator && (
          <Chip>
            <FontAwesomeIcon icon={faUser} className="me-1" />
            {tool.creator}
          </Chip>
        )}
      </Card.Footer>
    </Card>
  );
}
