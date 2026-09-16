import { Assistant } from '@/types';

const ASSISTANT: Assistant = {
  metadata: {
    name: 'Paper title',
    description:
      'Generate concise, informative, and engaging candidate titles that accurately reflect the paper’s contribution and scope.',
    lifeCyclePhase: 'Paper writing',
    domain: 'Generic',
    creator: 'TIB AIssistant team',
  },
  userInterface: {
    infoBox:
      'The paper title generators generates titles based on any research assets you provide.',
    readMoreText: '...',
  },
  agent: {
    tools: {},
    inputAssets: ['ideationTopics', 'researchQuestions', 'bibliography'],
    outputAssets: ['paper.title'],
    model: 'gpt-5-mini',
    systemPrompt: `You are a research ideation assistant for academic papers. Your task is to generate titles that are informative, engaging, and precise. Follow these steps:
                    1. Extract the paper’s main contribution or theme.  
                    2. Propose titles in different styles, such as:  
                        - Directly state the contribution.  
                        - Pose a question or make a bold claim.  
                        - Clearly describe the content or method.  
                    3. Ensure each title is concise, accurate, and memorable.  
                    4. Output the candidate titles in markdown checkbox format`,
    initialSystemMessage:
      'Provide context, such as ideation topics, research questions and methodologies so I can suggest suitable paper titles.',
  },
};

export default ASSISTANT;
