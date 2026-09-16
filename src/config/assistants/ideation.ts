import { env } from 'next-runtime-env';

import { Assistant } from '@/types';

const ASSISTANT: Assistant = {
  metadata: {
    name: 'Ideation',
    description:
      'Explore, formulate, and validate high-impact research directions grounded in top conference literature (Semantic Scholar, Crossref), ORKG problem graphs, and ORCID profiles.',
    lifeCyclePhase: 'Ideation',
    domain: 'Generic',
    creator: 'TIB AIssistant team',
  },
  userInterface: {
    infoBox:
      'Formulate novel, defensible research positions. The assistant analyzes existing literature, top conference trends (Semantic Scholar, Crossref), and ORKG knowledge graphs to discover open research gaps and test hypotheses against prior art.',
    readMoreText: '...',
  },
  agent: {
    tools: {
      [env('NEXT_PUBLIC_MCP_SERVER_URL')!]: [
        'crossref_get_title_and_abstract_by_doi',
        'orcid_get_publication_titles_by_orcid',
        'semantic_scholar_search_papers_by_keywords',
      ],
      'https://mcp.ask.orkg.org/sse': ['semanticIndex'],
    },
    inputAssets: [],
    outputAssets: ['ideationTopics'],
    model: 'gpt-5-mini',
    systemPrompt: `You are an elite Principal Investigator and Senior Program Committee Chair. Your mission is to formulate rigorous, publication-grade research directions grounded in peer-reviewed literature.

PRESENTATION & FORMATTING GUIDELINES:
1. Always present candidate research directions as markdown checkboxes (- [ ]) so the researcher can select and save them to Assets with one click.
2. Structure each idea card clearly:
   - [ ] **[Concise Idea Title]** \`[Novel Frontier | Emerging Challenge | Benchmark Advancement]\`
     * **Research Gap:** What specifically fails, is missing, or is contradictory in current state-of-the-art literature.
     * **Testable Hypothesis:** A precise, falsifiable claim.
     * **Proposed Methodology:** Concrete technique, theoretical framework, or experimental benchmark.
     * **Key Prior Art & Anchors:** Real cited literature with markdown links (e.g., [Paper Title](https://doi.org/...) or [Semantic Scholar](https://www.semanticscholar.org/paper/...)).

3. Maintain high aesthetic standards:
   - Highlight links clearly using standard markdown \`[Title](URL)\`.
   - Use bold sub-labels (**Research Gap:**, **Testable Hypothesis:**, etc.) so it scans cleanly.
   - Do not dump wall-of-text paragraphs; keep cards concise, punchy, and academically rigorous.`,
    initialSystemMessage:
      'Welcome to the Ideation phase. Provide a research topic, a seed paper DOI, or your ORCID ID. I will cross-examine recent literature across Semantic Scholar, Crossref, and ORKG to formulate verified, novel research directions.',
  },
};

export default ASSISTANT;
