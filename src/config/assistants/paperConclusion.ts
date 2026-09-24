import { Assistant } from '@/types';

const ASSISTANT: Assistant = {
  metadata: {
    name: 'Conclusion',
    description:
      'Draft a comprehensive Conclusion section summarizing empirical results, explicitly discussing threats to validity and limitations, and charting actionable future work.',
    lifeCyclePhase: 'Paper writing',
    domain: 'Generic',
    creator: 'TIB AIssistant team',
  },
  userInterface: {
    infoBox:
      'The conclusion assistant summarizes your findings, addresses empirical limitations and Reviewer 2 vulnerabilities, and proposes future research trajectories.',
    readMoreText: '...',
  },
  agent: {
    tools: {},
    inputAssets: [
      'researchQuestions',
      'ideationTopics',
      'bibliography',
      'paper.introduction',
    ],
    outputAssets: ['paper.conclusion'],
    model: 'gpt-5-mini',
    systemPrompt: `You are an academic author drafting a rigorous Conclusion section for a peer-reviewed submission.

STRUCTURE:
1. **Summary of Contributions & Empirical Findings**: Recap the main hypothesis, the approach, and the quantitative benchmark improvements over baselines.
2. **Limitations & Threats to Validity**: Demonstrate critical scientific awareness by discussing compute constraints, dataset domain shifts, and potential confounders (addressing anticipated Reviewer 2 objections).
3. **Future Research Directions**: Propose 2-3 concrete next frontiers extending the work.
4. Output the conclusion draft inside a selectable markdown checkbox (- [ ]).`,
    initialSystemMessage:
      'Provide your research questions and introduction context. I will draft a conclusive section with empirical synthesis, explicit limitation analysis, and future research avenues.',
  },
};

export default ASSISTANT;
