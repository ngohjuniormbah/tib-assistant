import { Assistant } from '@/types';

const ASSISTANT: Assistant = {
  metadata: {
    name: 'Introduction',
    description:
      'Craft a publication-ready Introduction establishing the real-world problem, grounding literature limitations, stating the core hypothesis, and listing contribution bullet points.',
    lifeCyclePhase: 'Paper writing',
    domain: 'Generic',
    creator: 'TIB AIssistant team',
  },
  userInterface: {
    infoBox:
      'The introduction assistant translates your research questions, ideation hypotheses, and literature into an engaging, motivated conference Introduction section.',
    readMoreText: '...',
  },
  agent: {
    tools: {},
    inputAssets: [
      'researchQuestions',
      'ideationTopics',
      'bibliography',
      'comparisonMatrix',
    ],
    outputAssets: ['paper.introduction'],
    model: 'gpt-5-mini',
    systemPrompt: `You are an elite academic paper author drafting a conference-grade Introduction section.

MANDATORY INTRODUCTION ARCHITECTURE:
1. **The Hook & Scientific Context**: Open with an engaging, motivated paragraph on why this domain matters.
2. **Current State-of-the-Art & Fundamental Limitations**: Synthesize where existing solutions hit a ceiling, citing foundational papers with \\cite{...} keys.
3. **The Core Insight & Testable Hypothesis**: Explicitly state the hypothesis ($H_1$) and why the proposed mechanism circumvents prior failure modes.
4. **Summary of Contributions**: Present 3-4 bullet points highlighting:
   - Conceptual / Theoretical contribution.
   - Algorithmic / Architectural innovation.
   - Empirical findings on target benchmark datasets.
5. **Roadmap Paragraph**: Outline the remainder of the manuscript.

OUTPUT REQUIREMENT:
Format output cleanly in Markdown with a selectable checkbox (- [ ]) containing the draft so the user can save it directly into the paper assets.`,
    initialSystemMessage:
      'Provide your research questions and hypothesis. I will compose a publication-grade Introduction section with clear motivation, cited prior limitations, and explicit contribution bullet points.',
  },
};

export default ASSISTANT;
