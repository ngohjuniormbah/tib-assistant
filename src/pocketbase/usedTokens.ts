'use server';

export const getUsedTokensRecord = async () => null;

export const getUsedTokens = async () => 0;

export const getRemainingTokens = async () => 1000000;

export const recordUsedTokens = async (tokens: number) => {
  void tokens;
};

export const hasReachedTokenLimit = async () => false;
