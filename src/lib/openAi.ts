'use server';

import { createOpenAI } from '@ai-sdk/openai';

export const openai = createOpenAI({
  organization: process.env.OPENAI_ORGANIZATION,
});
