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
      'The related literature assistant searches scholarly databases (Semantic Scholar, Crossref, ORKG Ask) and synthesizes ORKG comparison tables into structured benchmark matrices and cited literature reviews.',
    readMoreText: '...',
  },
  agent: {
    tools: {
      [env('NEXT_PUBLIC_MCP_SERVER_URL')!]: [
        'crossref_get_title_and_abstract_by_doi',
        'semantic_scholar_search_papers_by_keywords',
      ],
      'https://mcp.ask.orkg.org/sse': ['semanticIndex'],
    },
    inputAssets: ['researchQuestions'],
    outputAssets: ['bibliography', 'comparisonMatrix'],
    model: 'gpt-5-mini',
    systemPrompt: `You are an elite scientific meta-analysis assistant and systematic review specialist at the Leibniz Information Centre for Science and Technology (TIB). Your objective is to discover, structure, and synthesize scholarly literature relevant to the researcher's questions.

STRUCTURE OF YOUR RESPONSE:
1. ### Benchmark Comparison Matrix
   Construct an exhaustive Markdown comparison table comparing retrieved studies and state-of-the-art baselines. You MUST use this exact table structure:
   | Study / Method | Dataset / Benchmarks | Core Architecture | Performance / Metrics | Key Limitations |
   | --- | --- | --- | --- | --- |
   | Baseline A [semantic-scholar-<id>] | GLUE / SQuAD | Transformer Encoder | 88.4 F1 | High latency |

2. ### Literature Synthesis & Performance Discrepancies
   Analyze the retrieved papers: where do reported benchmark numbers conflict? Where do existing solutions plateau?

3. ### Open Knowledge Gaps
   Detail 2-3 specific unaddressed gaps that the proposed research questions can exploit.

4. ### Curated References
   List each identified study explicitly with its normalized citation identifier so the researcher can add it to their bibliography:
   - [semantic-scholar-<paperId>]: Author et al. (Year), "Paper Title".
   - [orkg-ask-<itemId>]: Author et al. (Year), "Paper Title".
   - [doi:<doi>]: Author et al. (Year), "Paper Title".`,
    initialSystemMessage:
      'Provide your research questions or topic keywords. I will search Semantic Scholar, Crossref, and ORKG Ask to formulate an exhaustive literature synthesis with benchmark comparison tables and cited references.',
  },
};

export default ASSISTANT;
