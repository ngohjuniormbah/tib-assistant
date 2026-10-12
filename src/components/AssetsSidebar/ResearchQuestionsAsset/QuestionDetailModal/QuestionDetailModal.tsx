'use client';

import { faCheck, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Chip,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  TextArea,
  TextField,
} from '@heroui/react';
import { FormEvent, useState } from 'react';

import {
  ResearchQuestionType,
  StructuredResearchQuestion,
} from '@/types/researchQuestions';

export type QuestionDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  question: StructuredResearchQuestion;
  onSave: (updatedQuestion: StructuredResearchQuestion) => void;
};

export default function QuestionDetailModal({
  isOpen,
  onClose,
  question,
  onSave,
}: QuestionDetailModalProps) {
  const [id, setId] = useState(question.id);
  const [title, setTitle] = useState(question.title);
  const [type, setType] = useState<ResearchQuestionType>(question.type);
  const [hypothesisTarget, setHypothesisTarget] = useState(
    question.hypothesisTarget
  );
  const [datasets, setDatasets] = useState(question.targetDatasets.join(', '));
  const [baselines, setBaselines] = useState(
    question.targetBaselines.join(', ')
  );
  const [metrics, setMetrics] = useState(question.evaluationMetrics.join(', '));
  const [validationProtocol, setValidationProtocol] = useState(
    question.validationProtocol
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const updated: StructuredResearchQuestion = {
      ...question,
      id,
      title,
      type,
      hypothesisTarget,
      targetDatasets: datasets
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean),
      targetBaselines: baselines
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean),
      evaluationMetrics: metrics
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean),
      validationProtocol,
      status: 'formalized',
    };
    onSave(updated);
    onClose();
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Container placement="top">
        <Modal.Dialog className="max-w-2xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faQuestionCircle}
                  className="text-muted"
                />
                <span>Formalize Research Question ({id})</span>
              </div>
            </Modal.Heading>
          </Modal.Header>

          <form onSubmit={handleSubmit}>
            <Modal.Body className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Chip size="sm">{type.toUpperCase()}</Chip>
                <Chip size="sm">Status: {question.status.toUpperCase()}</Chip>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <TextField className="sm:col-span-1 flex flex-col gap-1">
                  <Label className="text-xs font-semibold text-foreground">
                    RQ Identifier
                  </Label>
                  <Input
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    required
                  />
                </TextField>

                <div className="sm:col-span-3 flex flex-col gap-1">
                  <Label className="text-xs font-semibold text-foreground">
                    Typology
                  </Label>
                  <Select
                    selectedKey={type}
                    onSelectionChange={(key) =>
                      setType(key as ResearchQuestionType)
                    }
                    aria-label="Research Question Typology"
                  >
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        <ListBox.Item
                          id="efficacy"
                          textValue="Efficacy / Superiority"
                        >
                          Efficacy (Does method beat SOTA on benchmarks?)
                        </ListBox.Item>
                        <ListBox.Item
                          id="ablation"
                          textValue="Ablation / Attribution"
                        >
                          Ablation (Contribution of specific components)
                        </ListBox.Item>
                        <ListBox.Item
                          id="robustness"
                          textValue="Robustness / Generalization"
                        >
                          Robustness (Domain shift & stress testing)
                        </ListBox.Item>
                        <ListBox.Item
                          id="efficiency"
                          textValue="Efficiency / Complexity"
                        >
                          Efficiency (Latency, memory & compute trade-offs)
                        </ListBox.Item>
                        <ListBox.Item
                          id="theoretical"
                          textValue="Theoretical Formulation"
                        >
                          Theoretical (Formal guarantees & error bounds)
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm font-semibold text-foreground">
                  Question Formulation
                </Label>
                <TextArea
                  rows={2}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="resize-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm font-semibold text-foreground">
                  Target Hypothesis Claim
                </Label>
                <TextArea
                  rows={2}
                  value={hypothesisTarget}
                  onChange={(e) => setHypothesisTarget(e.target.value)}
                  className="resize-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm font-semibold text-foreground">
                  Validation Protocol
                </Label>
                <TextArea
                  rows={2}
                  value={validationProtocol}
                  onChange={(e) => setValidationProtocol(e.target.value)}
                  className="resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <TextField className="flex flex-col gap-1">
                  <Label className="text-xs font-semibold text-foreground">
                    Target Datasets
                  </Label>
                  <Input
                    placeholder="e.g. ImageNet, GLUE"
                    value={datasets}
                    onChange={(e) => setDatasets(e.target.value)}
                  />
                </TextField>

                <TextField className="flex flex-col gap-1">
                  <Label className="text-xs font-semibold text-foreground">
                    Baselines to Beat
                  </Label>
                  <Input
                    placeholder="e.g. SOTA model A, B"
                    value={baselines}
                    onChange={(e) => setBaselines(e.target.value)}
                  />
                </TextField>

                <TextField className="flex flex-col gap-1">
                  <Label className="text-xs font-semibold text-foreground">
                    Target Metrics
                  </Label>
                  <Input
                    placeholder="e.g. F1, Accuracy, Latency"
                    value={metrics}
                    onChange={(e) => setMetrics(e.target.value)}
                  />
                </TextField>
              </div>
            </Modal.Body>

            <Modal.Footer className="flex justify-end gap-2">
              <Button variant="secondary" onPress={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                <FontAwesomeIcon icon={faCheck} />
                <span>Save Question</span>
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
