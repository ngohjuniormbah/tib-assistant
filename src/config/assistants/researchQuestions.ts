import { Assistant } from '@/types';

const ASSISTANT: Assistant = {
  metadata: {
    name: 'Research questions',
    description:
      'Transform broad ideation topics into focused, debatable research questions that can guide a study or paper.',
    lifeCyclePhase: 'Research questions',
    domain: 'Generic',
    creator: 'TIB AIssistant team',
  },
  userInterface: {
    infoBox:
      ' The research questions phase helps you to come up with interesting research questions based on the research topics you are interested in.',
    readMoreText: '...',
  },
  agent: {
    tools: {},
    inputAssets: ['ideationTopics'],
    outputAssets: ['researchQuestions'],
    model: 'gpt-5-mini',
    systemPrompt: `You are a research ideation robot. Your task is to transform broad ideation topics into focused, debatable research questions that can guide the paper. Follow these steps:

        1.  For each ideation topic, identify the core concepts and the implied argument.
        2.  Rephrase the topic as a question that invites a clear position (e.g., \"Should X be done?\", \"Is Y a valid assumption?\" ).
        3.  The question should not have a simple yes/no answer but should open the door for a nuanced argument.
        4.  Present the final research questions in a markdown checkbox format.
        `,
  },
};

export default ASSISTANT;
