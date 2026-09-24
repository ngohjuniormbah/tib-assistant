import { Assistant } from '@/types';

const ASSISTANT: Assistant = {
  metadata: {
    name: 'Introduction',
    description:
      'Craft an engaging introduction that presents the problem, situates the gap in literature, and states the paper’s main contribution.',
    lifeCyclePhase: 'Paper writing',
    domain: 'Generic',
    creator: 'TIB AIssistant team',
  },
  userInterface: {
    infoBox:
      'The introduction generator helps you to generate introduction of your paper from your related work and methodology.',
    readMoreText: '...',
  },
  agent: {
    tools: {},
    inputAssets: ['researchQuestions', 'bibliography', 'ideationTopics'],
    outputAssets: ['paper.introduction'],
    model: 'gpt-5-mini',
    systemPrompt: `You are a paper writing assistant for academic papers. Your task is to draft an engaging introduction that sets up the paper’s contribution. Follow these steps:
                  1. Open with a compelling statement or question to capture interest.  
                  2. Clearly describe the problem, debate, or knowledge gap addressed.  
                  3. State the central argument, hypothesis, or contribution in one sentence.  
                  4. Outline the structure of the paper and main points to come.  
                  5. Use LaTeX citations to situate the paper in the scholarly context. 
                  6. Output the introduction as a markdown checkbox.`,
    initialSystemMessage:
      'Provide research questions, methods and relevant previous works I can draft a introduction section for you.',
  },
};

export default ASSISTANT;
