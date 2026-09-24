'use client';

import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Chip, useOverlayState } from '@heroui/react';
import { useState } from 'react';

import ExpandableItem from '@/components/AssetsSidebar/ExpandableItem/ExpandableItem';
import QuestionDetailModal from '@/components/AssetsSidebar/ResearchQuestionsAsset/QuestionDetailModal/QuestionDetailModal';
import useIndexedDbStore from '@/components/useIndexedDbStore/useIndexedDbStore';
import getAssetById from '@/lib/getAssetById';
import {
  formatQuestionForChat,
  parseResearchQuestionItem,
} from '@/lib/researchQuestionUtils';
import { StructuredResearchQuestion } from '@/types/researchQuestions';

export type ResearchQuestionsAssetProps = {
  enableInput?: boolean;
};

export default function ResearchQuestionsAsset({
  enableInput = false,
}: ResearchQuestionsAssetProps) {
  const [selectedQuestion, setSelectedQuestion] =
    useState<StructuredResearchQuestion | null>(null);
  const detailModalState = useOverlayState();

  const { asset: questionsStore, update } = useIndexedDbStore({
    assetId: 'researchQuestions',
  });

  const rqAssetConfig = getAssetById('researchQuestions');
  if (!rqAssetConfig) {
    return null;
  }

  const rawItems = questionsStore ?? [];
  const parsedQuestions: StructuredResearchQuestion[] = rawItems.map(
    (item, index) => parseResearchQuestionItem(item, index + 1)
  );

  const handleOpenDetail = (question: StructuredResearchQuestion) => {
    setSelectedQuestion(question);
    detailModalState.open();
  };

  const handleSaveQuestion = async (updated: StructuredResearchQuestion) => {
    const updatedList = parsedQuestions.map((existing) =>
      existing.id === updated.id
        ? JSON.stringify(updated)
        : JSON.stringify(existing)
    );
    await update(updatedList);
  };

  const handleDeleteQuestion = async (id: string) => {
    const remaining = parsedQuestions
      .filter((q) => q.id !== id)
      .map((q) => JSON.stringify(q));
    await update(remaining);
  };

  const formattedContentForChat = parsedQuestions.map((q) =>
    formatQuestionForChat(q)
  );

  return (
    <ExpandableItem
      asset={rqAssetConfig}
      itemCount={parsedQuestions.length}
      enableInput={enableInput}
      assetContent={formattedContentForChat}
    >
      <div className="w-full space-y-2 mt-2">
        {parsedQuestions.length === 0 ? (
          <Alert>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                No empirical research questions formalized yet.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        ) : (
          parsedQuestions.map((q) => (
            <div
              key={q.id}
              className="p-2.5 rounded-xl border border-border bg-surface-secondary/50 flex flex-col gap-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs text-foreground">
                    {q.id}
                  </span>
                  <Chip size="sm">{q.type.toUpperCase()}</Chip>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    isIconOnly
                    variant="ghost"
                    aria-label={`Edit ${q.id}`}
                    onPress={() => handleOpenDetail(q)}
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
                    aria-label={`Delete ${q.id}`}
                    onPress={() => handleDeleteQuestion(q.id)}
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="text-muted text-xs"
                    />
                  </Button>
                </div>
              </div>

              <p className="text-xs text-foreground font-medium line-clamp-2 m-0">
                {q.title}
              </p>

              {q.targetDatasets.length > 0 && (
                <div className="text-[11px] text-muted truncate">
                  <span className="font-semibold">Datasets:</span>{' '}
                  {q.targetDatasets.join(', ')}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {detailModalState.isOpen && selectedQuestion && (
        <QuestionDetailModal
          isOpen={detailModalState.isOpen}
          onClose={detailModalState.close}
          question={selectedQuestion}
          onSave={handleSaveQuestion}
        />
      )}
    </ExpandableItem>
  );
}
