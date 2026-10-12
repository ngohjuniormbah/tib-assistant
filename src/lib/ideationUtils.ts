import { StructuredIdea } from '@/types/ideation';

/**
 * Parse an idea from a JSON string or markdown bullet point into a StructuredIdea
 */
export function parseIdeaItem(raw: string): StructuredIdea {
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.title &&
      parsed.hypothesis
    ) {
      return parsed as StructuredIdea;
    }
  } catch {
    // Not valid JSON; parse from plain text or markdown
  }

  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const firstLine = lines[0] || raw;
  const cleanTitle = firstLine
    .replace(/^[-*]\s*\[[ xX]?\]\s*/, '')
    .replace(/^\*\*|\*\*$/g, '')
    .replace(/^#+\s*/, '')
    .trim();

  const gapLine = lines.find(
    (line) =>
      line.toLowerCase().includes('gap') ||
      line.toLowerCase().includes('limitation')
  );
  const hypothesisLine = lines.find(
    (line) =>
      line.toLowerCase().includes('hypothesis') ||
      line.toLowerCase().includes('claim')
  );
  const methodLine = lines.find(
    (line) =>
      line.toLowerCase().includes('method') ||
      line.toLowerCase().includes('approach')
  );
  const evalLine = lines.find(
    (line) =>
      line.toLowerCase().includes('evaluation') ||
      line.toLowerCase().includes('benchmark') ||
      line.toLowerCase().includes('dataset')
  );

  return {
    id: `idea-${Math.random().toString(36).substring(2, 9)}`,
    title: cleanTitle || 'Untitled Research Idea',
    field: 'General Research',
    gapSummary: gapLine
      ? gapLine.replace(/^[*-\s]+/, '').replace(/^[*_]+|[*_]+$/g, '')
      : 'Identified through literature gap analysis',
    hypothesis: {
      statement: hypothesisLine
        ? hypothesisLine.replace(/^[*-\s]+/, '').replace(/^[*_]+|[*_]+$/g, '')
        : cleanTitle,
      nullHypothesis:
        'No statistically significant performance delta or effect over current baselines ($H_0$).',
      theoreticalGrounding:
        'Scientific literature consensus and benchmark ceilings',
    },
    methodology: {
      approach: methodLine
        ? methodLine.replace(/^[*-\s]+/, '').replace(/^[*_]+|[*_]+$/g, '')
        : 'Formulate an algorithmic or empirical mechanism addressing the core gap',
      targetDatasets: evalLine ? [evalLine.replace(/^[*-\s]+/, '')] : [],
      baselines: [],
      evaluationMetrics: [],
    },
    feasibility: {
      computeLevel: 'medium',
      estimatedTimelineMonths: 6,
      targetVenues: ['Top-tier Conference / Journal'],
    },
    provenance: {
      orkgComparisonIds: [],
      groundingCitations: [],
      noveltyScore: 88,
    },
    reviewRisks: [
      'Potential empirical confounders under covariate domain shifts.',
      'Baseline hyperparameter sensitivity and ablation rigor.',
    ],
    status: 'draft',
  };
}

/**
 * Check if an idea matches an item in the saved assets
 */
export function isIdeaSelected(
  savedItems: string[],
  labelOrId: string
): boolean {
  const normalizedTarget = labelOrId
    .replace(/^[-*]\s*\[[ xX]?\]\s*/, '')
    .replace(/^\*\*|\*\*$/g, '')
    .trim();

  return savedItems.some((item) => {
    if (item === labelOrId || item === normalizedTarget) return true;
    try {
      const parsed = JSON.parse(item);
      if (
        parsed.id === labelOrId ||
        parsed.title === labelOrId ||
        parsed.title === normalizedTarget
      ) {
        return true;
      }
    } catch {
      // Plain text check
      if (item.includes(normalizedTarget) || normalizedTarget.includes(item)) {
        return true;
      }
    }
    return false;
  });
}

/**
 * Format a StructuredIdea into an academic prompt text representation for downstream assistants
 */
export function formatIdeaForChat(idea: StructuredIdea): string {
  return [
    `Research Idea: ${idea.title}`,
    `Gap: ${idea.gapSummary}`,
    `Hypothesis (H1): ${idea.hypothesis.statement}`,
    `Null Hypothesis (H0): ${idea.hypothesis.nullHypothesis}`,
    `Methodology: ${idea.methodology.approach}`,
    idea.methodology.targetDatasets.length > 0
      ? `Target Datasets: ${idea.methodology.targetDatasets.join(', ')}`
      : null,
    idea.feasibility.targetVenues.length > 0
      ? `Target Venues: ${idea.feasibility.targetVenues.join(', ')}`
      : null,
  ]
    .filter(Boolean)
    .join(' | ');
}
