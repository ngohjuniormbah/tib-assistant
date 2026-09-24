export type IdeaFeasibilityLevel = 'low' | 'medium' | 'high';

export type StructuredIdeaHypothesis = {
  statement: string;
  nullHypothesis: string;
  theoreticalGrounding: string;
};

export type StructuredIdeaMethodology = {
  approach: string;
  targetDatasets: string[];
  baselines: string[];
  evaluationMetrics: string[];
};

export type StructuredIdeaFeasibility = {
  computeLevel: IdeaFeasibilityLevel;
  estimatedTimelineMonths: number;
  targetVenues: string[];
};

export type StructuredIdeaProvenance = {
  seedDoi?: string;
  orkgProblemId?: string;
  orkgComparisonIds: string[];
  groundingCitations: Array<{
    title: string;
    doi?: string;
    paperId?: string;
  }>;
  noveltyScore: number; // 0 to 100
  collisionWarning?: string;
};

export type StructuredIdea = {
  id: string;
  title: string;
  field: string;
  gapSummary: string;
  hypothesis: StructuredIdeaHypothesis;
  methodology: StructuredIdeaMethodology;
  feasibility: StructuredIdeaFeasibility;
  provenance: StructuredIdeaProvenance;
  reviewRisks: string[]; // Key vulnerabilities (Reviewer 2 stress-test)
  status: 'draft' | 'validated' | 'committed';
};
