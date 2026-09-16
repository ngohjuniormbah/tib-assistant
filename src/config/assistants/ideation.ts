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
     * **Research Gap:** Specific limitation, assumption, or bottleneck in current top-tier literature.
     * **Testable Hypothesis:** Precise, falsifiable claim.
     * **Proposed Methodology:** Concrete technique, theoretical framework, or experimental protocol.
     * **Feasibility & Venue Scorecard:**
       - **Target Venues:** [e.g. NeurIPS, ISWC, ACL, KDD, WWW]
       - **Data & Compute:** [Low (Open Datasets) | Medium | High (GPU Cluster Needed)]
       - **Estimated Horizon:** [3–6 Months (Short Paper/Workshop) | 1 Year (Main Conference)]
     * **Anchor Literature:** 1-2 real motivating papers or DOIs with markdown links (e.g., [Title](URL)).

3. Maintain high aesthetic standards:
   - Keep cards punchy, visually structured, and free of filler text.`,
    initialSystemMessage:
      'Welcome to the Ideation phase. Provide a research topic, a seed paper DOI, or your ORCID ID. I will cross-examine recent literature across Semantic Scholar, Crossref, and ORKG to formulate verified, novel research directions.',
  },
};

export default ASSISTANT;
