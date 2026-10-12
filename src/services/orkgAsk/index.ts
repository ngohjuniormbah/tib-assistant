import ky from 'ky';

import { components } from '@/services/orkgAsk/types';

export const orkgAskApi = ky.create({ prefixUrl: 'https://api.ask.orkg.org' });

export const searchItems = async ({
  query,
  limit,
  offset,
}: {
  query: string;
  limit: number;
  offset: number;
}) => {
  const { payload } = await orkgAskApi
    .get('index/search', {
      searchParams: {
        query,
        limit,
        offset,
      },
    })
    .json<components['schemas']['QdrantPagedDocumentsResponse']>();

  return payload;
};

export const getItemById = async (itemId: string) => {
  try {
    const response = await orkgAskApi
      .get(`index/get/${itemId}`)
      .json<components['schemas']['QdrantSingleDocumentResponse']>();

    return response.payload;
  } catch (error) {
    console.error('Failed to fetch item by ID:', error);
    return null;
  }
};
