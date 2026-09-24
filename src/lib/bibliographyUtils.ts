export interface CitationData {
  title?: string;
  authors?: string[];
  year?: string;
  source?: string;
  doi?: string;
  abstract?: string;
}

export interface BibliographyItem {
  id: string;
  abstract: string;
  type: string;
  title: string;
  author: Array<{ literal: string }>;
  DOI?: string;
  issued?: {
    'date-parts': number[][];
  };
}

export function createBibliographyItemFromCitation(
  citationId: string,
  citationData: CitationData
): BibliographyItem {
  return {
    id: citationId,
    abstract: citationData.abstract || '',
    type: 'article',
    title: citationData.title || `Citation ${citationId}`,
    author: citationData.authors?.map((author) => ({ literal: author })) || [
      { literal: 'Unknown Author' },
    ],
    DOI: citationData.doi || undefined,
    issued: {
      'date-parts': [
        [parseInt(citationData.year || new Date().getFullYear().toString())],
      ],
    },
  };
}

export function normalizeCitationId(rawId: string): string {
  if (rawId.startsWith('orkg-ask-')) {
    return rawId.replace(/^orkg-ask-/, 'orkgAsk-');
  }
  if (rawId.startsWith('semantic-scholar-')) {
    return rawId.replace(/^semantic-scholar-/, 'semanticScholar-');
  }
  return rawId;
}

export function isItemInBibliography(
  bibliography: string[],
  itemId: string
): boolean {
  const parsedBibliography = bibliography.map((item) => JSON.parse(item));
  return parsedBibliography.some((item) => item.id === itemId);
}
