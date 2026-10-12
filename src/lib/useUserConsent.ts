import { useCallback } from 'react';
import useSWR from 'swr';

import { getUserConsentItems } from '@/pocketbase/userConsent';
import { UserConsentNameOptions } from '@/types/pocketbase-types';

export default function useUserConsent() {
  const { data: userConsent, mutate: mutateUserConsent } = useSWR(
    'getUserConsentItems',
    () => getUserConsentItems()
  );

  const isConsentGiven = useCallback(
    (name: UserConsentNameOptions) => {
      return userConsent?.some(
        (consent) => consent.name === name && consent.hasAccepted
      );
    },
    [userConsent]
  );

  return {
    userConsent,
    mutateUserConsent,
    isConsentGiven,
  };
}
