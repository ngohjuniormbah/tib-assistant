import ky from 'ky';

type SemanticScholarResponse = {
  total_hits: number;
  offset: number;
  data: {
    paperId: string;
    title: string;
    url: string;
    doi: string;
    authors: { name: string }[];
    abstract: string;
    year?: number;
  }[];
};

export const semanticScholarApi = ky.create({
  prefixUrl: 'https://api.semanticscholar.org/graph/v1',
});

export const searchPapers = async ({
  query,
  limit = 10,
  offset = 0,
}: {
  query: string;
  limit?: number;
  offset?: number;
}): Promise<SemanticScholarResponse | undefined> => {
  try {
    const response = await semanticScholarApi
      .get<SemanticScholarResponse>('paper/search', {
        searchParams: {
          query,
          offset,
          limit,
          fields: 'url,abstract,authors,title,year',
        },
        timeout: 8000,
        retry: 0,
      })
      .json();

    return response || [];
  } catch (error) {
    console.error('Error fetching data from Semantic Scholar API:', error);
    return undefined;
  }
};

export const getPaperById = async (paperId: string) => {
  try {
    const response = await semanticScholarApi
      .get('paper/' + paperId, {
        searchParams: {
          fields: 'url,abstract,authors,title,year',
        },
        timeout: 8000,
        retry: 0,
      })
      .json<{
        paperId: string;
        title: string;
        url: string;
        doi?: string;
        authors: { name: string }[];
        abstract?: string;
        year?: number;
      }>();

    return response;
  } catch (error) {
    console.error('Failed to fetch paper by ID:', error);
    return null;
  }
};
