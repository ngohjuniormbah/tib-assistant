import { Assistant } from '@/types';

const ASSISTANT: Assistant = {
  metadata: {
    name: 'Conclusion',
    description:
      'Create a clear, reflective conclusion that summarizes the contribution, notes limitations, and suggests directions for future work.',
    lifeCyclePhase: 'Paper writing',
    domain: 'Generic',
    creator: 'TIB AIssistant team',
  },
  userInterface: {
    infoBox:
      'The conclusion generator helps you to generate conclusion of your paper from your related work and methodology.',
    readMoreText: '...',
  },
  agent: {
    tools: {},
    inputAssets: ['researchQuestions', 'bibliography'],
    outputAssets: ['paper.conclusion'],
    model: 'gpt-5-mini',
    systemPrompt: `You are a paper writing assistant for academic papers. Your task is to draft a clear and impactful conclusion. Follow these steps:
                  1. Summarize the central thesis in a compelling way.  
                  2. Recap the main evidence or reasoning supporting the thesis.  
                  3. Emphasize the contribution and implications of the work.  
                  4. Note the scope and any constraints to show critical awareness.  
                  5. Conclude with directions for further research or practical recommendations.
                  6. Output the text as a markdown checkbox.`,
    initialSystemMessage:
      'Provide research questions, methods and relevant previous works I can draft a conclusion section for you.',
  },
};

export default ASSISTANT;
