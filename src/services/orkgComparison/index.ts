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

/**
 * Robustly extract any ORKG ID (e.g. R1702050, R1587225) from any text, URL, or broken line
 */
export function extractOrkgId(input: string): string | null {
  const match = input.match(/[RCP]\d+/i);
  return match ? match[0].toUpperCase() : null;
}

function cleanCell(s: string, maxLen = 80): string {
  if (!s) return '—';
  const clean = s.replace(/\r?\n/g, ' ').replace(/\|/g, '/').trim();
  return clean.length > maxLen ? clean.substring(0, maxLen - 1) + '…' : clean;
}

const IGNORED_PROPS = new Set([
  'has subfield',
  'web site',
  'doi',
  'publication month',
  'publication year',
  'contribution',
  '_class',
  'sameas',
  'seealso',
]);

type OrkgV3ComparisonResponse = {
  id?: string;
  title?: string;
  description?: string;
  contributions?: Array<{
    id: string;
    label?: string;
    paper_title?: string;
    paper_year?: number;
    paper_doi?: string;
  }>;
  properties?: Array<{
    id: string;
    label: string;
  }>;
  data?: Record<string, Array<Array<{ label?: string; value?: string }>>>;
  selected_contributions?: string[];
  versions?: { head?: { id?: string } };
};

export async function fetchOrkgComparison(
  input: string
): Promise<OrkgComparisonResult | null> {
  const comparisonId = extractOrkgId(input);
  if (!comparisonId) return null;

  let title = `ORKG Comparison ${comparisonId}`;
  let description = '';
  let headId = comparisonId;
  const paperMap = new Map<
    string,
    { id: string; name: string; properties: Record<string, string> }
  >();
  const propOrder: string[] = [];

  // Strategy 1: Fetch via ORKG REST API
  try {
    const meta = await ky
      .get(
        `https://orkg.org/api/comparisons/${encodeURIComponent(comparisonId)}`,
        {
          headers: {
            Accept: 'application/vnd.orkg.comparison.v3+json, application/json',
          },
          timeout: 15000,
        }
      )
      .json<OrkgV3ComparisonResponse>();

    title = meta.title || title;
    description = meta.description || '';
    if (meta.versions?.head?.id) headId = meta.versions.head.id;

    // If REST API contains structured contributions and properties data
    if (Array.isArray(meta.contributions) && meta.contributions.length > 0) {
      meta.contributions.forEach((contrib) => {
        const name =
          contrib.paper_title || contrib.label || `Study (${contrib.id})`;
        paperMap.set(contrib.id, {
          id: contrib.id,
          name,
          properties: {},
        });
      });

      if (Array.isArray(meta.properties)) {
        meta.properties.forEach((prop) => {
          if (
            !IGNORED_PROPS.has(prop.label.toLowerCase()) &&
            !propOrder.includes(prop.label)
          ) {
            propOrder.push(prop.label);
          }
        });
      }

      // Extract matrix cell values if present in data map
      if (meta.data && typeof meta.data === 'object') {
        Object.entries(meta.data).forEach(([propId, contribCellMap]) => {
          const matchedProp =
            meta.properties?.find((p) => p.id === propId)?.label || propId;
          if (Array.isArray(contribCellMap)) {
            contribCellMap.forEach((cellValues, cIdx) => {
              const targetContrib = meta.contributions?.[cIdx];
              if (targetContrib && paperMap.has(targetContrib.id)) {
                const cellText = cellValues
                  .map((v) => v.label || v.value || '')
                  .filter(Boolean)
                  .join(', ');
                if (cellText) {
                  paperMap.get(targetContrib.id)!.properties[matchedProp] =
                    cellText;
                }
              }
            });
          }
        });
      }
    }
  } catch (err) {
    console.warn('Notice from ORKG REST API comparison endpoint:', err);
  }

  // Strategy 2: If paperMap is still empty, query ORKG SPARQL
  if (paperMap.size === 0) {
    const sparql = `
PREFIX orkgr: <http://orkg.org/orkg/resource/>
PREFIX orkgp: <http://orkg.org/orkg/predicate/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?contrib ?contribLabel ?paperTitle ?propLabel ?valLabel ?val
WHERE {
  VALUES ?comp { orkgr:${comparisonId} orkgr:${headId} }
  {
    ?comp ?hasContrib ?contrib .
    OPTIONAL { ?contrib rdfs:label ?contribLabel }
    OPTIONAL {
      ?paper <http://orkg.org/orkg/predicate/P31> ?contrib ;
             rdfs:label ?paperTitle .
    }
    OPTIONAL {
      ?contrib ?prop ?val .
      ?prop rdfs:label ?propLabel .
      OPTIONAL { ?val rdfs:label ?valLabel }
    }
  } UNION {
    ?comp <http://orkg.org/orkg/predicate/compareContribution> ?contrib .
    OPTIONAL { ?contrib rdfs:label ?contribLabel }
    OPTIONAL {
      ?contrib ?prop ?val .
      ?prop rdfs:label ?propLabel .
      OPTIONAL { ?val rdfs:label ?valLabel }
    }
  }
} LIMIT 250`;

    try {
      const sparqlRes = await ky
        .post(SPARQL_ENDPOINT, {
          headers: {
            Accept: 'application/sparql-results+json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ query: sparql }).toString(),
          timeout: 20000,
        })
        .json<{
          results: { bindings: Array<Record<string, { value: string }>> };
        }>();

      const bindings = sparqlRes.results?.bindings ?? [];
      for (const b of bindings) {
        const contribId = b.contrib?.value?.split('/').pop() || '';
        const paperName =
          b.paperTitle?.value?.trim() ||
          b.contribLabel?.value?.trim() ||
          `Study (${contribId})`;
        if (!paperName) continue;

        if (!paperMap.has(paperName)) {
          paperMap.set(paperName, {
            id: contribId,
            name: paperName,
            properties: {},
          });
        }

        const rawProp = (b.propLabel?.value || '').trim();
        if (rawProp && !IGNORED_PROPS.has(rawProp.toLowerCase())) {
          if (!propOrder.includes(rawProp)) {
            propOrder.push(rawProp);
          }
          const val = (b.valLabel?.value || b.val?.value || '').trim();
          if (val) {
            paperMap.get(paperName)!.properties[rawProp] = val;
          }
        }
      }
    } catch (sparqlErr) {
      console.warn('Notice from ORKG SPARQL comparison endpoint:', sparqlErr);
    }
  }

  // Fallback: If statements / graph were minimal, still produce comparison entry from metadata
  if (paperMap.size === 0 && title !== `ORKG Comparison ${comparisonId}`) {
    paperMap.set('study-1', {
      id: comparisonId,
      name: title,
      properties: { Description: description || 'Comparison from ORKG' },
    });
    propOrder.push('Description');
  }

  const contributions: OrkgComparisonContribution[] = Array.from(
    paperMap.values()
  ).map((p) => ({
    id: p.id,
    name: p.name,
    year: null,
    doi: undefined,
    properties: p.properties,
    formattedSummary: Object.entries(p.properties)
      .map(([k, v]) => `- **${k}**: ${v}`)
      .join('\n'),
  }));

  const propertyColumns = propOrder.length > 0 ? propOrder : ['Summary'];

  let markdownTable = '';
  if (contributions.length > 0) {
    const headerRow = ['Study / Method', ...propertyColumns];
    const sepRow = headerRow.map(() => '---');
    const tableRows = contributions.map((c) => {
      const cells = propertyColumns.map((prop) =>
        cleanCell(c.properties[prop] || '—', 60)
      );
      return `| ${cleanCell(c.name, 40)} | ${cells.join(' | ')} |`;
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
}

export async function fetchMultipleOrkgComparisons(
  inputs: string[]
): Promise<OrkgComparisonResult[]> {
  const settled = await Promise.allSettled(
    inputs.map((input) => fetchOrkgComparison(input))
  );
  const results: OrkgComparisonResult[] = [];
  for (const s of settled) {
    if (s.status === 'fulfilled' && s.value && s.value.contributionCount > 0) {
      results.push(s.value);
    }
  }
  return results;
}
