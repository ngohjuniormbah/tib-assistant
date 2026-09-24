import ideation from '@/config/assistants/ideation';
import paperAbstract from '@/config/assistants/paperAbstract';
import paperConclusion from '@/config/assistants/paperConclusion';
import paperIntroduction from '@/config/assistants/paperIntroduction';
import paperRelatedWork from '@/config/assistants/paperRelatedWork';
import paperTitle from '@/config/assistants/paperTitle';
import relatedLiterature from '@/config/assistants/relatedLiterature';
import researchQuestions from '@/config/assistants/researchQuestions';
import review from '@/config/assistants/review';
import { Assistant } from '@/types';

const withIds = (assistants: Record<string, Assistant>) => {
  const result: Record<string, Assistant & { id: string }> = {};

  Object.entries(assistants).forEach(([id, assistant]) => {
    result[id] = { ...assistant, id };
  });

  return result;
};

const ASSISTANTS = withIds({
  ideation,
  paperAbstract,
  paperConclusion,
  paperIntroduction,
  paperRelatedWork,
  paperTitle,
  relatedLiterature,
  researchQuestions,
  review,
});

export default ASSISTANTS;
