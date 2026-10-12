import {
  ResearchQuestionType,
  StructuredResearchQuestion,
} from '@/types/researchQuestions';

/**
 * Determine question typology based on label keywords
 */
function inferQuestionType(text: string): ResearchQuestionType {
  const lower = text.toLowerCase();
  if (
    lower.includes('ablation') ||
    lower.includes('component') ||
    lower.includes('contribution of')
  ) {
    return 'ablation';
  }
  if (
    lower.includes('robustness') ||
    lower.includes('generaliz') ||
    lower.includes('shift') ||
    lower.includes('adversar')
  ) {
    return 'robustness';
  }
  if (
    lower.includes('efficien') ||
    lower.includes('latency') ||
    lower.includes('memory') ||
    lower.includes('compute')
  ) {
    return 'efficiency';
  }
  if (
    lower.includes('theor') ||
    lower.includes('proof') ||
    lower.includes('bound')
  ) {
    return 'theoretical';
  }
  return 'efficacy';
}

/**
 * Parse an RQ from a JSON string or markdown bullet point into a StructuredResearchQuestion
 */
export function parseResearchQuestionItem(
  raw: string,
  fallbackIndex = 1
): StructuredResearchQuestion {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.title && parsed.type) {
      return parsed as StructuredResearchQuestion;
    }
  } catch {
    // Not valid JSON; parse from markdown
  }

  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const firstLine = lines[0] || raw;

  // Extract RQ tag if present (e.g. "**RQ1 (Efficacy):** To what degree...")
  const rqMatch = firstLine.match(/\b(RQ\d+)\b/i);
  const rqId = rqMatch ? rqMatch[1].toUpperCase() : `RQ${fallbackIndex}`;

  const cleanTitle = firstLine
    .replace(/^[-*]\s*\[[ xX]?\]\s*/, '')
    .replace(/^\*\*|\*\*$/g, '')
    .replace(/^RQ\d+[^:]*:\s*/i, '')
    .trim();

  const hypothesisLine = lines.find(
    (l) =>
      l.toLowerCase().includes('hypothesis') ||
      l.toLowerCase().includes('target')
  );
  const evalLine = lines.find(
    (l) =>
      l.toLowerCase().includes('eval') ||
      l.toLowerCase().includes('protocol') ||
      l.toLowerCase().includes('metric')
  );
  const datasetLine = lines.find(
    (l) =>
      l.toLowerCase().includes('dataset') ||
      l.toLowerCase().includes('benchmark')
  );

  return {
    id: rqId,
    title: cleanTitle || `Research Question ${fallbackIndex}`,
    type: inferQuestionType(firstLine),
    hypothesisTarget: hypothesisLine
      ? hypothesisLine.replace(/^[*-\s]+/, '').replace(/^[*_]+|[*_]+$/g, '')
      : 'Evaluates core hypothesis claim',
    targetDatasets: datasetLine
      ? [datasetLine.replace(/^[*-\s]+/, '').replace(/^[*_]+|[*_]+$/g, '')]
      : [],
    targetBaselines: [],
    evaluationMetrics: [],
    validationProtocol: evalLine
      ? evalLine.replace(/^[*-\s]+/, '').replace(/^[*_]+|[*_]+$/g, '')
      : 'Controlled empirical benchmark evaluation against state-of-the-art baselines',
    status: 'draft',
  };
}

/**
 * Check if a research question matches an item in saved assets
 */
export function isQuestionSelected(
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
        parsed.title === normalizedTarget ||
        normalizedTarget.includes(parsed.title)
      ) {
        return true;
      }
    } catch {
      if (item.includes(normalizedTarget) || normalizedTarget.includes(item)) {
        return true;
      }
    }
    return false;
  });
}

/**
 * Format a StructuredResearchQuestion into prompt string for downstream assistants (Literature Review / Paper Writing)
 */
export function formatQuestionForChat(q: StructuredResearchQuestion): string {
  return [
    `[${q.id} - ${q.type.toUpperCase()}]: ${q.title}`,
    `Target: ${q.hypothesisTarget}`,
    q.targetDatasets.length > 0
      ? `Datasets: ${q.targetDatasets.join(', ')}`
      : null,
    `Protocol: ${q.validationProtocol}`,
  ]
    .filter(Boolean)
    .join(' | ');
}
