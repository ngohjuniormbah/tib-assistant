type AssetType = 'text' | 'json' | 'object';

export type AssetId = string;

export type Asset = {
  id: AssetId;
  name: string;
  type: AssetType;
  schema?: Omit<Asset, 'schema'>[];
};

const ASSETS: Asset[] = [
  {
    id: 'ideationTopics',
    name: 'Ideation topics',
    type: 'json',
  },
  {
    id: 'bibliography',
    name: 'Bibliography',
    type: 'json',
  },
  {
    id: 'researchQuestions',
    name: 'Research questions',
    type: 'text',
  },
  {
    id: 'comparisonMatrix',
    name: 'Comparison matrix',
    type: 'text',
  },
  {
    id: 'paper',
    name: 'Paper',
    type: 'object',
    schema: [
      {
        id: 'paper.title',
        name: 'Title',
        type: 'text',
      },
      {
        id: 'paper.abstract',
        name: 'Abstract',
        type: 'text',
      },
      {
        id: 'paper.introduction',
        name: 'Introduction',
        type: 'text',
      },
      {
        id: 'paper.relatedWork',
        name: 'Related work',
        type: 'text',
      },
      {
        id: 'paper.conclusion',
        name: 'Conclusion',
        type: 'text',
      },
    ],
  },
];

export default ASSETS;
