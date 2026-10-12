'use server';

import { UserConsentNameOptions } from '@/types/pocketbase-types';

export const getUserConsentItems = async () => {
  return [
    { name: UserConsentNameOptions.openAi, hasAccepted: true },
    { name: UserConsentNameOptions.termsOfUse, hasAccepted: true },
    { name: UserConsentNameOptions.gravatar, hasAccepted: true },
  ];
};

export const updateUserConsent = async (args?: unknown) => {
  void args;
  return true;
};
