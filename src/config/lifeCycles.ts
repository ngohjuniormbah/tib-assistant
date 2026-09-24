export type LifeCycleAssistants = (
  | string
  | { groupName: string; assistants: string[] }
)[];

type LifeCycles = {
  [key: string]: {
    metadata: {
      name: string;
      description: string;
      domain: string;
      creator: string;
    };
    assistants: LifeCycleAssistants;
  };
};

const LIFE_CYCLES: LifeCycles = {
  default: {
    metadata: {
      name: 'Default pipeline',
      description:
        'This is a generic pipeline that works well for demonstration purposes and to test out the system ',
      domain: 'Generic',
      creator: 'TIB AIssistant team',
    },
    assistants: [
      'ideation',
      'researchQuestions',
      'relatedLiterature',
      {
        groupName: 'Paper writing',
        assistants: [
          'paperTitle',
          'paperAbstract',
          'paperIntroduction',
          'paperRelatedWork',
          'paperConclusion',
        ],
      },
      'review',
    ],
  },
  smallPipeline: {
    metadata: {
      name: 'Ideation pipeline',
      description:
        'Only for coming up with research ideas and questions and exploring related literature.',
      domain: 'Generic',
      creator: 'TIB AIssistant team',
    },
    assistants: ['ideation', 'researchQuestions', 'relatedLiterature'],
  },
};

export default LIFE_CYCLES;
