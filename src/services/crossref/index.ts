import ky from 'ky';

export type CrossrefWork = {
  doi: string;
  title: string;
  authors: string[];
  year?: number;
  venue?: string;
  url?: string;
};

/**
 * Searches Crossref works across IEEE, ACM, Springer, Nature, and conference proceedings
 */
export async function searchCrossrefWorks({
  query,
  rows = 5,
}: {
  query: string;
  rows?: number;
}): Promise<CrossrefWork[]> {
  try {
    const res = await ky
      .get('https://api.crossref.org/works', {
        searchParams: {
          query,
          rows,
          sort: 'relevance',
          select: 'DOI,title,author,issued,container-title,URL',
        },
        headers: {
          'User-Agent': 'TIB-AIssistant/2.3 (mailto:information@tib.eu)',
        },
        timeout: 4500,
        retry: 0,
      })
      .json<{
        message?: {
          items?: Array<{
            DOI?: string;
            title?: string[];
            author?: Array<{ given?: string; family?: string }>;
            issued?: { 'date-parts'?: number[][] };
            'container-title'?: string[];
            URL?: string;
          }>;
        };
      }>();

    const items = res?.message?.items || [];
    return items.map((item) => {
      const title = item.title?.[0] || 'Untitled Publication';
      const authors =
        item.author?.map((a) =>
          [a.given, a.family].filter(Boolean).join(' ')
        ) || [];
      const year = item.issued?.['date-parts']?.[0]?.[0];
      const venue = item['container-title']?.[0];
      const doi = item.DOI || '';
      const url = item.URL || (doi ? `https://doi.org/${doi}` : undefined);

      return {
        doi,
        title,
        authors,
        year,
        venue,
        url,
      };
    });
  } catch (error) {
    console.warn('Crossref search notice:', error);
    return [];
  }
}
