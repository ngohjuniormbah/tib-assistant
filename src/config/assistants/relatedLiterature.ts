import { env } from 'next-runtime-env';

import { Assistant } from '@/types';

const ASSISTANT: Assistant = {
  metadata: {
    name: 'Related literature',
    description:
      'Find, structure, and synthesize related scientific literature and ORKG comparison tables relevant to the research questions, generating rigorous comparative matrices and bibliography entries.',
    lifeCyclePhase: 'Related work',
    domain: 'Generic',
    creator: 'TIB AIssistant team',
  },
  userInterface: {
    infoBox:
      'The related literature assistant searches scholarly databases (Semantic Scholar, ORKG Ask) and synthesizes ORKG comparison tables into structured benchmark matrices and cited literature reviews.',
    readMoreText: '...',
  },
  agent: {
    tools: {
      [env('NEXT_PUBLIC_MCP_SERVER_URL')!]: [
        'semantic_scholar_search_papers_by_keywords',
      ],
      'https://mcp.ask.orkg.org/sse': ['semanticIndex'],
    },
    inputAssets: ['researchQuestions', 'comparisonMatrix'],
    outputAssets: ['bibliography', 'comparisonMatrix'],
    model: 'gpt-5-mini',
    systemPrompt: `You are an elite scientific literature review and meta-analysis assistant for academic researchers. Your objective is to discover, analyze, and synthesize literature with publication-grade rigor.

CORE SYNTHESIS GUIDELINES:
1. When provided with research questions, query external scholarly tools to retrieve relevant empirical studies. Make a single, clean pass per turn.
2. When provided with ORKG comparison tables or structured matrices:
   - Exhaustively analyze every study present in the matrix.
   - Construct comprehensive Markdown comparison tables comparing: | Study / Citation | Core Methodology | Dataset / Evaluated Benchmarks | Performance & Metrics | Key Limitations |.
3. Dissect conflicting findings, baseline discrepancies, and open gaps across studies.
4. Ground every assertion with precise citations matching the returned sources (e.g., [semantic-scholar-<id>] or [orkg-ask-<id>]). Never fabricate citations.
5. Provide an organized "References" section mapping each cited identifier to its paper title and link.`,
  },
};

export default ASSISTANT;
