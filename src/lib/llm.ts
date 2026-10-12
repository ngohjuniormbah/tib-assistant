'use server';

// eslint-disable-next-line no-restricted-imports
import { generateText as generateTextAi, streamText as streamTextAi } from 'ai';
import { unauthorized } from 'next/navigation';

import { isAuthenticated } from '@/pocketbase/auth';
import {
  getRemainingTokens,
  hasReachedTokenLimit,
  recordUsedTokens,
} from '@/pocketbase/usedTokens';

const MAX_INPUT_CHARACTER_COUNT = 1000000;
const MAX_OUTPUT_TOKENS = 16384; // this is the maximum output tokens for 4o-mini, setting a higher limit causes an exception in the OpenAI API

export async function checkIfLLmCanBeCalled(
  props: Parameters<typeof streamTextAi>[0]
) {
  if (!(await isAuthenticated())) {
    return unauthorized();
  }

  if (await hasReachedTokenLimit()) {
    throw new Error(
      'You have reached your daily token limit. Please try again tomorrow.'
    );
  }

  // most models will not support this many characters, but we set a high limit anyway top prevent going too much over the limit in case the daily limited is reached
  const characterCount = JSON.stringify(
    `${props.messages} ${props.prompt} ${props.system}`
  ).length;
  if (characterCount > MAX_INPUT_CHARACTER_COUNT) {
    throw new Error(
      'You have reached the maximum input character count. Please reduce the size of your input.'
    );
  }

  return true;
}

const getMaxTokens = async () => {
  const remainingTokens = await getRemainingTokens();
  return remainingTokens > MAX_OUTPUT_TOKENS
    ? MAX_OUTPUT_TOKENS
    : remainingTokens;
};

export const streamText = async (
  props: Parameters<typeof streamTextAi>[0]
): Promise<ReturnType<typeof streamTextAi> | undefined> => {
  const llmCanBeCalled = await checkIfLLmCanBeCalled(props);

  if (llmCanBeCalled) {
    return streamTextAi({
      maxOutputTokens: await getMaxTokens(),
      seed: 256,
      onStepFinish: (result) => {
        recordUsedTokens(result.usage.totalTokens ?? 0);
      },
      ...props,
    });
  }
};

export const generateText = async (
  props: Parameters<typeof generateTextAi>[0]
): Promise<ReturnType<typeof generateTextAi> | undefined> => {
  const llmCanBeCalled = await checkIfLLmCanBeCalled(props);

  if (llmCanBeCalled) {
    return generateTextAi({
      maxOutputTokens: await getMaxTokens(),
      seed: 256,
      onStepFinish: (result) => {
        recordUsedTokens(result.usage.totalTokens ?? 0);
      },
      ...props,
    });
  }
};
