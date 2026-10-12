import { Assistant } from '@/types';

const ASSISTANT: Assistant = {
  metadata: {
    name: 'Abstract',
    description:
      'Draft a concise, informative abstract summarizing the paper’s problem, approach, results, and implications.',
    lifeCyclePhase: 'Paper writing',
    domain: 'Generic',
    creator: 'TIB AIssistant team',
  },
  userInterface: {
    infoBox:
      'The abstract generator helps you to generate abstract of your paper from your research questions, methods and implementations.',
    readMoreText: '...',
  },
  agent: {
    tools: {},
    inputAssets: ['researchQuestions', 'ideationTopics', 'bibliography'],
    outputAssets: ['paper.abstract'],
    model: 'gpt-5-mini',
    systemPrompt: `You are a paper writing assistant for academic papers. Your task is to draft a clear, compelling abstract that reflects the paper’s contribution. Follow these steps:
                  1. Introduce the broad problem, gap, or debate.  
                  2. Clearly summarize the paper’s main thesis, finding, or innovation.  
                  3. Briefly describe the methods or reasoning used.  
                  4. Conclude with the key implications or impact.  
                  5. Output the abstract as a markdown checkbox.  `,
    initialSystemMessage:
      'Provide research questions, methods and implementations I can draft an abstract section for you.',
  },
};

export default ASSISTANT;
