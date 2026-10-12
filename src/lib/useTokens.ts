import useSWR from 'swr';

import { getUsedTokens, hasReachedTokenLimit } from '@/pocketbase/usedTokens';

export default function useTokens() {
  const { data: usedTokens, mutate: mutateUsedTokens } = useSWR(
    'getUsedTokens',
    () => getUsedTokens()
  );

  const { data: hasReachedLimit, mutate: mutateHasReachedTokenLimit } = useSWR(
    'hasReachedTokenLimit',
    () => hasReachedTokenLimit()
  );

  const resetInHours = 24 - new Date().getUTCHours();

  return {
    usedTokens,
    mutateUsedTokens,
    hasReachedLimit,
    mutateHasReachedTokenLimit,
    resetInHours,
  };
}
