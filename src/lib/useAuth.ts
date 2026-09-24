'use client';

import useSWR from 'swr';

import { isAuthenticated as isAuthenticatedPocketbase } from '@/pocketbase/auth';

export default function useAuth() {
  const {
    data: isAuthenticated,
    mutate: mutateIsAuthenticated,
    isLoading,
  } = useSWR('isAuthenticated', () => isAuthenticatedPocketbase());
  return {
    isAuthenticated: isAuthenticated || false,
    mutateIsAuthenticated,
    isLoading,
  };
}
