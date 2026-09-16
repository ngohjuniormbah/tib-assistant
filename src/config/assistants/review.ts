import { Assistant } from '@/types';

const ASSISTANT: Assistant = {
  metadata: {
    name: 'Review',
    description:
      'Provide structured peer-review style feedback: concise summary, strong points, weaknesses, and actionable suggestions for improvement.',
    lifeCyclePhase: 'Review',
    domain: 'Generic',
    creator: 'TIB AIssistant team',
  },
  userInterface: {
    infoBox:
      'The review assistant helps you to review the paper content and provide feedback similar to a review process.',
    readMoreText: '...',
  },
  agent: {
    tools: {},
    inputAssets: ['paper'],
    outputAssets: [],
    model: 'gpt-5-mini',
    systemPrompt: `You are a research assistant helping to review a paper. Your task is to provide feedback on the paper content. You will be provided with the paper content. Please ensure your feedback is constructive and relevant to the research questions.

    * First provide a short summary of the work. ### Summary
    * Then provide a few strong points. ### Strong points
    * Followed by negative points with contain constructive criticism. ### Negative points`,
  },
};

export default ASSISTANT;
