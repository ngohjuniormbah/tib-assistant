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
        [
          parseInt(
            citationData.year || new Date().getFullYear().toString(),
            10
          ),
        ],
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

export function generateBibtexKey(
  item: Record<string, unknown>,
  index: number
): string {
  if (item.id && typeof item.id === 'string') {
    return item.id.replace(/[^a-zA-Z0-9_-]/g, '');
  }
  const firstAuthor =
    Array.isArray(item.author) && item.author[0]
      ? (
          item.author[0].family ||
          item.author[0].literal ||
          'author'
        ).toLowerCase()
      : 'author';
  const cleanAuthor = String(firstAuthor).replace(/[^a-zA-Z]/g, '');
  return `${cleanAuthor || 'entry'}${index + 1}`;
}

export function formatBibtexAuthors(authors: unknown): string {
  if (!Array.isArray(authors) || authors.length === 0) {
    return 'Unknown Author';
  }
  return authors
    .map((author) => {
      if (typeof author === 'string') return author;
      if (author && typeof author === 'object') {
        const a = author as {
          family?: string;
          given?: string;
          literal?: string;
        };
        if (a.family && a.given) return `${a.family}, ${a.given}`;
        if (a.family) return a.family;
        if (a.literal) return a.literal;
      }
      return 'Author';
    })
    .join(' and ');
}

export function cslToBibtex(bibliography: string[]): string {
  return bibliography
    .map((rawItem, index) => {
      try {
        const item = JSON.parse(rawItem) as Record<string, unknown>;
        const key = generateBibtexKey(item, index);
        const title = (item.title as string) || 'Untitled';
        const authorStr = formatBibtexAuthors(item.author);
        const year =
          item.issued &&
          typeof item.issued === 'object' &&
          'date-parts' in item.issued &&
          Array.isArray(
            (item.issued as { 'date-parts': number[][] })['date-parts']?.[0]
          )
            ? (item.issued as { 'date-parts': number[][] })['date-parts'][0][0]
            : '2024';
        const doi = item.DOI ? `,\n  doi = {${item.DOI}}` : '';

        return `@article{${key},
  title = {${title}},
  author = {${authorStr}},
  year = {${year}}${doi}
}`;
      } catch {
        return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}
