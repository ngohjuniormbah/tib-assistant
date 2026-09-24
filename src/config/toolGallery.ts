import { env } from 'next-runtime-env';

export type ToolGalleryItem = {
  mcpToolName: string;
  name: string;
  domain?: string;
  creator?: string;
  description: string;
  gdpr?: {
    country?: string;
    domain?: string;
  };
};

export type ToolGallery = {
  [mcpUrl: string]: ToolGalleryItem[];
};

const ASK_GDPR_INFO = {
  country: 'Germany',
  domain: 'ask.orkg.org',
};

const TOOL_GALLERY: ToolGallery = {
  [env('NEXT_PUBLIC_MCP_SERVER_URL')!]: [
    {
      mcpToolName: 'crossref_get_title_and_abstract_by_doi',
      name: 'Crossref',
      domain: 'Generic',
      creator: 'TIB AIssistant team',
      description: 'Fetches metadata for a given DOI.',
      gdpr: {
        country: 'USA',
        domain: 'crossref.org',
      },
    },
    {
      mcpToolName: 'orcid_get_publication_titles_by_orcid',
      name: 'ORCID',
      domain: 'Generic',
      creator: 'TIB AIssistant team',
      description: 'Fetches metadata for a given ORCID.',
      gdpr: {
        country: 'USA',
        domain: 'orcid.org',
      },
    },
    {
      mcpToolName: 'semantic_scholar_search_papers_by_keywords',
      name: 'Semantic Scholar',
      domain: 'Generic',
      creator: 'TIB AIssistant team',
      description: 'Searches for papers using the Semantic Scholar API.',
      gdpr: {
        country: 'USA',
        domain: 'semanticscholar.org',
      },
    },
    // {
    //   mcpToolName: 'unpaywall',
    //   name: 'Unpaywall',
    //   domain: 'Generic',
    //   creator: 'TIB AIssistant team',
    //   description: 'Fetches paper links based on a title or DOI.',
    //   gdpr: {
    //     country: 'USA',
    //     domain: 'unpaywall.org',
    //   },
    // },
  ],
  'https://mcp.ask.orkg.org/sse': [
    {
      mcpToolName: 'semanticIndex',
      name: 'Search for articles',
      domain: 'General',
      creator: 'ORKG Ask',
      description: 'Search for articles by providing a research question',
      gdpr: ASK_GDPR_INFO,
    },
  ],
};

export default TOOL_GALLERY;
