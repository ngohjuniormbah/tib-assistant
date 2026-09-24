'use client';

import {
  faCheck,
  faFlask,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Chip,
  Input,
  Label,
  Modal,
  TextArea,
  TextField,
} from '@heroui/react';
import { FormEvent, useState } from 'react';

import { StructuredIdea } from '@/types/ideation';

export type IdeaDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  idea: StructuredIdea;
  onSave: (updatedIdea: StructuredIdea) => void;
};

export default function IdeaDetailModal({
  isOpen,
  onClose,
  idea,
  onSave,
}: IdeaDetailModalProps) {
  const [title, setTitle] = useState(idea.title);
  const [gapSummary, setGapSummary] = useState(idea.gapSummary);
  const [hypothesisStatement, setHypothesisStatement] = useState(
    idea.hypothesis.statement
  );
  const [nullHypothesis, setNullHypothesis] = useState(
    idea.hypothesis.nullHypothesis
  );
  const [approach, setApproach] = useState(idea.methodology.approach);
  const [datasets, setDatasets] = useState(
    idea.methodology.targetDatasets.join(', ')
  );
  const [baselines, setBaselines] = useState(
    idea.methodology.baselines.join(', ')
  );
  const [metrics, setMetrics] = useState(
    idea.methodology.evaluationMetrics.join(', ')
  );
  const [targetVenues, setTargetVenues] = useState(
    idea.feasibility.targetVenues.join(', ')
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const updated: StructuredIdea = {
      ...idea,
      title,
      gapSummary,
      hypothesis: {
        ...idea.hypothesis,
        statement: hypothesisStatement,
        nullHypothesis,
      },
      methodology: {
        ...idea.methodology,
        approach,
        targetDatasets: datasets
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
        baselines: baselines
          .split(',')
          .map((b) => b.trim())
          .filter(Boolean),
        evaluationMetrics: metrics
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean),
      },
      feasibility: {
        ...idea.feasibility,
        targetVenues: targetVenues
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
      },
      status: 'validated',
    };
    onSave(updated);
    onClose();
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Container placement="top">
        <Modal.Dialog className="max-w-3xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faFlask} className="text-muted" />
                <span>Heilmeier Research Hypothesis Scorecard</span>
              </div>
            </Modal.Heading>
          </Modal.Header>

          <form onSubmit={handleSubmit}>
            <Modal.Body className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap pb-1">
                <Chip size="sm">Novelty: {idea.provenance.noveltyScore}%</Chip>
                <Chip size="sm">
                  Compute: {idea.feasibility.computeLevel.toUpperCase()}
                </Chip>
                <Chip size="sm">Status: {idea.status.toUpperCase()}</Chip>
              </div>

              <TextField className="w-full flex flex-col gap-1.5">
                <Label className="text-sm font-semibold text-foreground">
                  Idea Title
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </TextField>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-semibold text-foreground">
                  Knowledge Gap / SOTA Bottleneck
                </Label>
                <TextArea
                  rows={2}
                  value={gapSummary}
                  onChange={(e) => setGapSummary(e.target.value)}
                  className="resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-semibold text-foreground">
                    Core Hypothesis ($H_1$)
                  </Label>
                  <TextArea
                    rows={3}
                    value={hypothesisStatement}
                    onChange={(e) => setHypothesisStatement(e.target.value)}
                    className="resize-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-semibold text-foreground">
                    Null Hypothesis ($H_0$)
                  </Label>
                  <TextArea
                    rows={3}
                    value={nullHypothesis}
                    onChange={(e) => setNullHypothesis(e.target.value)}
                    className="resize-none"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-semibold text-foreground">
                  Proposed Methodology / Architecture
                </Label>
                <TextArea
                  rows={2}
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  className="resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <TextField className="w-full flex flex-col gap-1">
                  <Label className="text-xs font-semibold text-foreground">
                    Target Datasets
                  </Label>
                  <Input
                    placeholder="e.g. GLUE, SQuAD"
                    value={datasets}
                    onChange={(e) => setDatasets(e.target.value)}
                  />
                </TextField>

                <TextField className="w-full flex flex-col gap-1">
                  <Label className="text-xs font-semibold text-foreground">
                    Baselines to Beat
                  </Label>
                  <Input
                    placeholder="e.g. RoBERTa-large, GPT-4o"
                    value={baselines}
                    onChange={(e) => setBaselines(e.target.value)}
                  />
                </TextField>

                <TextField className="w-full flex flex-col gap-1">
                  <Label className="text-xs font-semibold text-foreground">
                    Evaluation Metrics
                  </Label>
                  <Input
                    placeholder="e.g. Accuracy, Latency"
                    value={metrics}
                    onChange={(e) => setMetrics(e.target.value)}
                  />
                </TextField>
              </div>

              <TextField className="w-full flex flex-col gap-1">
                <Label className="text-xs font-semibold text-foreground">
                  Target Venues
                </Label>
                <Input
                  placeholder="e.g. NeurIPS, ISWC, ACL"
                  value={targetVenues}
                  onChange={(e) => setTargetVenues(e.target.value)}
                />
              </TextField>

              {idea.reviewRisks && idea.reviewRisks.length > 0 && (
                <div className="p-3 rounded-lg bg-surface-secondary border border-border space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <FontAwesomeIcon
                      icon={faShieldHalved}
                      className="text-muted"
                    />
                    <span>Reviewer 2 Stress-Test Vulnerabilities:</span>
                  </div>
                  <ul className="text-xs text-muted list-disc list-inside space-y-1">
                    {idea.reviewRisks.map((risk, idx) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Modal.Body>

            <Modal.Footer className="flex justify-end gap-2">
              <Button variant="secondary" onPress={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                <FontAwesomeIcon icon={faCheck} />
                <span>Save Hypothesis</span>
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
