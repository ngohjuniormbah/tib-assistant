'use client';

import {
  faLightbulb,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip } from '@heroui/react';

import ExpandableMessage from '@/components/ExpandableMessage/ExpandableMessage';
import getAssetById from '@/lib/getAssetById';
import { parseIdeaItem } from '@/lib/ideationUtils';
import { parseResearchQuestionItem } from '@/lib/researchQuestionUtils';
import { CustomUIDataTypes } from '@/types';

type Props = {
  data: CustomUIDataTypes['asset'];
};

export default function AssetsMessage({ data }: Props) {
  const asset = getAssetById(data.assetId);

  if (!asset) {
    return null;
  }

  // 1. Render Ideation Topics as formatted scientific hypothesis cards
  if (data.assetId === 'ideationTopics') {
    const ideas = data.content.map((item) => parseIdeaItem(item));
    return (
      <ExpandableMessage
        key={asset.id}
        title={`Input: ${asset.name} (${ideas.length})`}
        onDelete={() => {}}
        content={
          <div className="space-y-3 my-2 text-sm text-foreground">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="p-3 rounded-xl border border-border bg-surface-secondary/40 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faLightbulb}
                    className="text-muted text-xs"
                  />
                  <span className="font-bold text-foreground">
                    {idea.title}
                  </span>
                  <Chip size="sm">
                    {idea.feasibility.computeLevel.toUpperCase()}
                  </Chip>
                </div>
                <p className="text-xs text-muted m-0">
                  <span className="font-semibold text-foreground">
                    Hypothesis ($H_1$):
                  </span>{' '}
                  {idea.hypothesis.statement}
                </p>
                <p className="text-xs text-muted m-0">
                  <span className="font-semibold text-foreground">Gap:</span>{' '}
                  {idea.gapSummary}
                </p>
              </div>
            ))}
          </div>
        }
      />
    );
  }

  // 2. Render Research Questions as formatted inquiry cards
  if (data.assetId === 'researchQuestions') {
    const questions = data.content.map((item, index) =>
      parseResearchQuestionItem(item, index + 1)
    );
    return (
      <ExpandableMessage
        key={asset.id}
        title={`Input: ${asset.name} (${questions.length})`}
        onDelete={() => {}}
        content={
          <div className="space-y-2 my-2 text-sm text-foreground">
            {questions.map((q) => (
              <div
                key={q.id}
                className="p-2.5 rounded-xl border border-border bg-surface-secondary/40 space-y-1"
              >
                <div className="flex items-center gap-1.5">
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    className="text-muted text-xs"
                  />
                  <span className="font-bold text-xs">{q.id}</span>
                  <Chip size="sm">{q.type.toUpperCase()}</Chip>
                </div>
                <p className="text-xs font-medium text-foreground m-0">
                  {q.title}
                </p>
              </div>
            ))}
          </div>
        }
      />
    );
  }

  // Fallback for generic text
  return (
    <ExpandableMessage
      key={asset.id}
      title={`Input: ${asset.name}`}
      onDelete={() => {}}
      content={
        <div className="ps-2 my-3 text-sm">
          <ul className="list-disc list-inside space-y-1">
            {data.content.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      }
    />
  );
}
