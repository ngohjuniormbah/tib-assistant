export type ComparisonMatrixRow = {
  studyId: string;
  studyTitle: string;
  doi?: string;
  url?: string;
  year?: number;
  properties: Record<string, string>; // property name -> value
};

export type StructuredComparisonMatrix = {
  id: string;
  title: string;
  researchQuestionId?: string; // Associated RQ (e.g. "RQ1")
  properties: string[]; // Column headers e.g. ["Dataset", "Methodology", "Accuracy / F1", "Limitations"]
  rows: ComparisonMatrixRow[];
  markdownTable: string;
};
