export type ResearchQuestionType =
  | 'efficacy'
  | 'ablation'
  | 'robustness'
  | 'efficiency'
  | 'theoretical';

export type StructuredResearchQuestion = {
  id: string; // e.g. "RQ1", "RQ2"
  title: string;
  type: ResearchQuestionType;
  hypothesisTarget: string; // Which hypothesis/claim does this question evaluate?
  targetDatasets: string[];
  targetBaselines: string[];
  evaluationMetrics: string[];
  validationProtocol: string;
  orkgProblemId?: string;
  status: 'draft' | 'validated' | 'formalized';
};
