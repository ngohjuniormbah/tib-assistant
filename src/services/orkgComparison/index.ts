'use server';

import ky from 'ky';

export type OrkgComparisonContribution = {
  id: string;
  name: string;
  year?: number | null;
  doi?: string;
  properties: Record<string, string>;
  formattedSummary: string;
};

export type OrkgComparisonResult = {
  id: string;
  title: string;
  description: string;
  contributionCount: number;
  contributions: OrkgComparisonContribution[];
  propertyColumns: string[];
  markdownTable: string;
  rawUrl: string;
};

const SPARQL_ENDPOINT = 'https://orkg.org/triplestore/sparql';
const ORKG_URL_ID_REGEX = /orkg\.org\/(?:[a-z0-9_-]+\/)+([A-Za-z0-9_-]+)/i;
const ORKG_ID_REGEX = /^(R|C|P|CONTRIBUTION)[_\d][A-Za-z0-9_-]*$/i;

function extractOrkgId(input: string): string | null {
  const trimmed = input.trim();
  const urlMatch = ORKG_URL_ID_REGEX.exec(trimmed);
  if (urlMatch && urlMatch[1]) return urlMatch[1];
  if (ORKG_ID_REGEX.test(trimmed)) return trimmed;
  return null;
}

function cleanCell(s: string, maxLen = 70): string {
  if (!s) return '—';
  const clean = s.replace(/\r?\n/g, ' ').replace(/\|/g, '/').trim();
  return clean.length > maxLen ? clean.substring(0, maxLen - 1) + '…' : clean;
}

const IGNORED_PROPS = new Set([
  'has subfield', 'web site', 'doi', 'publication month', 
  'publication year', 'contribution', '_class', 'sameas', 'seealso'
]);

export async function fetchOrkgComparison(input: string): Promise<OrkgComparisonResult | null> {
  const comparisonId = extractOrkgId(input);
  if (!comparisonId) return null;

  let title = `ORKG Comparison ${comparisonId}`;
  let description = '';
  let headId = comparisonId;

  try {
    const meta = await ky.get(`https://orkg.org/api/comparisons/${encodeURIComponent(comparisonId)}`, {
      headers: { Accept: 'application/vnd.orkg.comparison.v3+json' },
      timeout: 15000,
    }).json<any>();
    
    title = meta.title || title;
    description = meta.description || '';
    if (meta.versions?.head?.id) headId = meta.versions.head.id;
  } catch {}

  const sparql = `
PREFIX orkgr: <http://orkg.org/orkg/resource/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?paperTitle ?contrib ?propLabel ?valLabel ?val
WHERE {
  VALUES ?comp { orkgr:${comparisonId} orkgr:${headId} }
  ?comp ?hasContrib ?contrib .
  ?paper <http://orkg.org/orkg/predicate/P31> ?contrib ; rdfs:label ?paperTitle .
  ?contrib ?prop ?val .
  ?prop rdfs:label ?propLabel .
  OPTIONAL { ?val rdfs:label ?valLabel }
} LIMIT 50`;

  try {
    const sparqlRes = await ky.post(SPARQL_ENDPOINT, {
      headers: {
        Accept: 'application/sparql-results+json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ query: sparql }).toString(),
      timeout: 25000,
    }).json<any>();

    const bindings = sparqlRes.results?.bindings ?? [];
    const paperMap = new Map<string, { id: string; name: string; properties: Record<string, string> }>();
    const propOrder: string[] = [];

    for (const b of bindings) {
      const paperTitle = b.paperTitle?.value?.trim();
      if (!paperTitle) continue;

      const contribId = b.contrib?.value?.split('/')?.pop() || '';
      if (!paperMap.has(paperTitle)) {
        paperMap.set(paperTitle, {
          id: contribId,
          name: paperTitle,
          properties: {},
        });
      }

      const rawProp = (b.propLabel?.value || '').trim();
      const normKey = rawProp.toLowerCase();
      if (rawProp && !IGNORED_PROPS.has(normKey)) {
        if (!propOrder.includes(normKey)) {
          propOrder.push(normKey);
        }
        const val = (b.valLabel?.value || b.val?.value || '').trim();
        paperMap.get(paperTitle)!.properties[normKey] = val;
      }
    }

    const contributions: OrkgComparisonContribution[] = Array.from(paperMap.values()).map(p => ({
      id: p.id,
      name: p.name,
      year: null,
      doi: undefined,
      properties: p.properties,
      formattedSummary: Object.entries(p.properties).map(([k, v]) => `- **${k}**: ${v}`).join('\n'),
    }));

    const propertyColumns = propOrder;

    let markdownTable = '';
    if (contributions.length && propertyColumns.length) {
      const headerRow = ['Properties', ...contributions.map(c => cleanCell(c.name, 45))];
      const sepRow = headerRow.map(() => '---');
      const tableRows = propertyColumns.map(prop => {
        const cells = contributions.map(c => cleanCell(c.properties[prop] || '—', 60));
        return `| ${cleanCell(prop, 25)} | ${cells.join(' | ')} |`;
      });

      markdownTable = [
        `| ${headerRow.join(' | ')} |`,
        `| ${sepRow.join(' | ')} |`,
        ...tableRows,
      ].join('\n');
    }

    return {
      id: comparisonId,
      title,
      description,
      contributionCount: contributions.length,
      contributions,
      propertyColumns,
      markdownTable,
      rawUrl: input.trim(),
    };
  } catch (err) {
    console.error('SPARQL fetch error:', err);
    return null;
  }
}

export async function fetchMultipleOrkgComparisons(inputs: string[]): Promise<OrkgComparisonResult[]> {
  const settled = await Promise.allSettled(inputs.map(input => fetchOrkgComparison(input)));
  const results: OrkgComparisonResult[] = [];
  for (const s of settled) {
    if (s.status === 'fulfilled' && s.value && s.value.contributionCount > 0) {
      results.push(s.value);
    }
  }
  return results;
}
