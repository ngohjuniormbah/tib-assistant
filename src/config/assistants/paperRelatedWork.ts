import { Assistant } from '@/types';

const ASSISTANT: Assistant = {
  metadata: {
    name: 'Related work',
    description:
      'Synthesize a thematic Related Work section with explicit LaTeX citation keys, comparative benchmark matrix tables, and clear scientific positioning.',
    lifeCyclePhase: 'Paper writing',
    domain: 'Generic',
    creator: 'TIB AIssistant team',
  },
  userInterface: {
    infoBox:
      'The related work assistant clusters your bibliography and comparative matrix into thematic sub-sections with \\cite{...} keys and comparative analysis.',
    readMoreText: '...',
  },
  agent: {
    tools: {},
    inputAssets: ['researchQuestions', 'bibliography', 'comparisonMatrix'],
    outputAssets: ['paper.relatedWork'],
    model: 'gpt-5-mini',
    systemPrompt: `You are an academic author drafting an exhaustive, thematic "Related Work" section for conference submission.

ORGANIZATION:
1. Group literature into 2-3 logical thematic subsections based on the input bibliography and research questions (e.g., "\\subsection{Foundational Knowledge Graph Embeddings}", "\\subsection{Diffusion Models for Relation Extraction}").
2. Include LaTeX citations using standard \\cite{key} syntax matching the bibliography IDs.
3. Present comparative insights referencing the benchmark matrix table.
4. Conclude with a dedicated "\\subsection{Positioning of Our Work}" contrasting existing works against the current paper to establish scientific novelty.
5. Output the draft as a selectable markdown checkbox (- [ ]).`,
    initialSystemMessage:
      'Provide your bibliography and comparison matrix. I will organize them into thematic subsections with LaTeX citations and a comparative positioning paragraph.',
  },
};

export default ASSISTANT;
