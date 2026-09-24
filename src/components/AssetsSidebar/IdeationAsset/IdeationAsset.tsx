'use client';

import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Chip, useOverlayState } from '@heroui/react';
import { useState } from 'react';

import ExpandableItem from '@/components/AssetsSidebar/ExpandableItem/ExpandableItem';
import IdeaDetailModal from '@/components/AssetsSidebar/IdeationAsset/IdeaDetailModal/IdeaDetailModal';
import useIndexedDbStore from '@/components/useIndexedDbStore/useIndexedDbStore';
import getAssetById from '@/lib/getAssetById';
import { formatIdeaForChat, parseIdeaItem } from '@/lib/ideationUtils';
import { StructuredIdea } from '@/types/ideation';

export type IdeationAssetProps = {
  enableInput?: boolean;
};

export default function IdeationAsset({
  enableInput = false,
}: IdeationAssetProps) {
  const [selectedIdea, setSelectedIdea] = useState<StructuredIdea | null>(null);
  const detailModalState = useOverlayState();

  const { asset: ideationStore, update } = useIndexedDbStore({
    assetId: 'ideationTopics',
  });

  const ideationAssetConfig = getAssetById('ideationTopics');
  if (!ideationAssetConfig) {
    return null;
  }

  const rawItems = ideationStore ?? [];
  const parsedIdeas: StructuredIdea[] = rawItems.map((item) =>
    parseIdeaItem(item)
  );

  const handleOpenDetail = (idea: StructuredIdea) => {
    setSelectedIdea(idea);
    detailModalState.open();
  };

  const handleSaveIdea = async (updated: StructuredIdea) => {
    const updatedList = parsedIdeas.map((existing) =>
      existing.id === updated.id
        ? JSON.stringify(updated)
        : JSON.stringify(existing)
    );
    await update(updatedList);
  };

  const handleDeleteIdea = async (id: string) => {
    const remaining = parsedIdeas
      .filter((idea) => idea.id !== id)
      .map((idea) => JSON.stringify(idea));
    await update(remaining);
  };

  // Formatted summaries for sending to chat
  const formattedContentForChat = parsedIdeas.map((idea) =>
    formatIdeaForChat(idea)
  );

  return (
    <ExpandableItem
      asset={ideationAssetConfig}
      itemCount={parsedIdeas.length}
      enableInput={enableInput}
      assetContent={formattedContentForChat}
    >
      <div className="w-full space-y-2 mt-2">
        {parsedIdeas.length === 0 ? (
          <Alert>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                No research ideas formulated yet.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        ) : (
          parsedIdeas.map((idea) => (
            <div
              key={idea.id}
              className="p-2.5 rounded-xl border border-border bg-surface-secondary/50 flex flex-col gap-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-xs leading-snug line-clamp-2 text-foreground">
                  {idea.title}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    isIconOnly
                    variant="ghost"
                    aria-label="Edit idea"
                    onPress={() => handleOpenDetail(idea)}
                  >
                    <FontAwesomeIcon
                      icon={faPen}
                      className="text-muted text-xs"
                    />
                  </Button>
                  <Button
                    size="sm"
                    isIconOnly
                    variant="ghost"
                    aria-label="Delete idea"
                    onPress={() => handleDeleteIdea(idea.id)}
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="text-muted text-xs"
                    />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <Chip size="sm">
                  {idea.feasibility.computeLevel.toUpperCase()}
                </Chip>
                <Chip size="sm">Score: {idea.provenance.noveltyScore}%</Chip>
              </div>

              <p className="text-xs text-muted line-clamp-2 m-0">
                {idea.hypothesis.statement}
              </p>
            </div>
          ))
        )}
      </div>

      {detailModalState.isOpen && selectedIdea && (
        <IdeaDetailModal
          isOpen={detailModalState.isOpen}
          onClose={detailModalState.close}
          idea={selectedIdea}
          onSave={handleSaveIdea}
        />
      )}
    </ExpandableItem>
  );
}
