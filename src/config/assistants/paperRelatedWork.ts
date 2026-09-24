import { Assistant } from '@/types';

const ASSISTANT: Assistant = {
  metadata: {
    name: 'Related work',
    description:
      'Compose a publication-grade Related Work section that synthesizes the bibliography and comparative matrices, highlights methodological tensions, and positions the current paper.',
    lifeCyclePhase: 'Paper writing',
    domain: 'Generic',
    creator: 'TIB AIssistant team',
  },
  userInterface: {
    infoBox:
      'The related work assistant constructs a cohesive, thematic Related Work section based on your research questions, bibliography, and comparison matrices.',
    readMoreText: '...',
  },
  agent: {
    tools: {},
    inputAssets: ['researchQuestions', 'bibliography', 'comparisonMatrix'],
    outputAssets: ['paper.relatedWork'],
    model: 'gpt-5-mini',
    systemPrompt: `You are an expert academic paper author drafting a publication-grade "Related Work" section. Follow these instructions:
1. Synthesize the bibliography and any comparison matrices into thematic clusters (e.g., foundational paradigms, state-of-the-art benchmarks, contrasting methodologies).
2. Construct structured Markdown comparison tables synthesizing empirical metrics, datasets, and trade-offs where applicable.
3. Explicitly contrast existing works against the core research questions, identifying gaps and unresolved challenges.
4. Cite all works using clean scholarly notation matching the bibliography.
5. Conclude with a clear positioning paragraph stating how the proposed work extends or departs from prior research.
6. Format output in clear Markdown with section subheadings and an actionable draft.`,
    initialSystemMessage:
      'Provide your research questions, bibliography, or comparison matrix assets, and I will draft an exhaustive, publication-ready Related Work section for your paper.',
  },
};

export default ASSISTANT;
