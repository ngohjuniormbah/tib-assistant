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

const SPARQL_ENDPOINT = 'https://orkg.org/sparql';

/**
 * Extracts any ORKG ID (e.g. R1587227, R1702050, R1587225) regardless of URL prefix or line-breaks
 */
function extractOrkgId(input: string): string | null {
  const match = input.match(/[RCP]\d+/i);
  return match ? match[0].toUpperCase() : null;
}

function cleanCell(s: string, maxLen = 80): string {
  if (!s) return '—';
  const clean = s.replace(/\r?\n/g, ' ').replace(/\|/g, '/').trim();
  return clean.length > maxLen ? clean.substring(0, maxLen - 1) + '…' : clean;
}

type StatementResponse = {
  content?: Array<{
    predicate: { id: string; label: string };
    object: { id?: string; label?: string; _class?: string };
  }>;
};

export async function fetchOrkgComparison(
  input: string
): Promise<OrkgComparisonResult | null> {
  const comparisonId = extractOrkgId(input);
  if (!comparisonId) return null;

  let title = `ORKG Comparison ${comparisonId}`;
  let description = '';
  const paperMap = new Map<
    string,
    { id: string; name: string; properties: Record<string, string> }
  >();
  const propOrder: string[] = [];

  // Layer 1: Fetch resource metadata to get the actual title
  try {
    const resource = await ky
      .get(
        `https://orkg.org/api/resources/${encodeURIComponent(comparisonId)}`,
        { timeout: 10000 }
      )
      .json<{ id: string; label: string }>();
    if (resource?.label) {
      title = resource.label;
    }
  } catch {
    // continue
  }

  // Layer 2: Fetch statements directly (works for ALL published and draft comparisons)
  try {
    const statements = await ky
      .get(
        `https://orkg.org/api/statements/subject/${encodeURIComponent(comparisonId)}?size=150`,
        {
          timeout: 12000,
        }
      )
      .json<
        | StatementResponse
        | Array<{
            predicate: { id: string; label: string };
            object: { id?: string; label?: string };
          }>
      >();

    const stmts = Array.isArray(statements)
      ? statements
      : statements.content || [];

    for (const stmt of stmts) {
      const predLabel = stmt.predicate?.label?.toLowerCase() || '';
      const objLabel = stmt.object?.label || '';
      const objId = stmt.object?.id || '';

      if (predLabel === 'description') {
        description = objLabel;
      } else if (
        predLabel.includes('contribution') ||
        stmt.predicate?.id === 'compareContribution' ||
        stmt.predicate?.id === 'hasContribution' ||
        stmt.predicate?.id === 'P31'
      ) {
        const contribId = objId || `contrib-${paperMap.size + 1}`;
        const name = objLabel || `Study (${contribId})`;
        if (!paperMap.has(contribId)) {
          paperMap.set(contribId, { id: contribId, name, properties: {} });
        }
      } else if (
        objLabel &&
        !['has subfield', 'sameas', 'seealso'].includes(predLabel)
      ) {
        if (!propOrder.includes(stmt.predicate.label)) {
          propOrder.push(stmt.predicate.label);
        }
      }
    }
  } catch (err) {
    console.warn('Notice from ORKG statements API:', err);
  }

  // Layer 3: Query ORKG Virtuoso SPARQL (https://orkg.org/sparql)
  if (paperMap.size === 0) {
    const sparql = `
PREFIX orkgr: <http://orkg.org/orkg/resource/>
PREFIX orkgp: <http://orkg.org/orkg/predicate/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?contrib ?contribLabel ?paperTitle ?propLabel ?valLabel ?val
WHERE {
  VALUES ?comp { orkgr:${comparisonId} }
  {
    ?comp ?p ?contrib .
    OPTIONAL { ?contrib rdfs:label ?contribLabel }
    OPTIONAL {
      ?paper orkgp:P31 ?contrib ;
             rdfs:label ?paperTitle .
    }
    OPTIONAL {
      ?contrib ?prop ?val .
      ?prop rdfs:label ?propLabel .
      OPTIONAL { ?val rdfs:label ?valLabel }
    }
  }
} LIMIT 100`;

    try {
      const sparqlRes = await ky
        .post(SPARQL_ENDPOINT, {
          headers: {
            Accept: 'application/sparql-results+json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ query: sparql }).toString(),
          timeout: 15000,
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

        if (!paperMap.has(contribId)) {
          paperMap.set(contribId, {
            id: contribId,
            name: paperName,
            properties: {},
          });
        }

        const rawProp = (b.propLabel?.value || '').trim();
        if (
          rawProp &&
          !['has subfield', 'sameas'].includes(rawProp.toLowerCase())
        ) {
          if (!propOrder.includes(rawProp)) {
            propOrder.push(rawProp);
          }
          const val = (b.valLabel?.value || b.val?.value || '').trim();
          if (val) {
            paperMap.get(contribId)!.properties[rawProp] = val;
          }
        }
      }
    } catch (sparqlErr) {
      console.warn('Notice from SPARQL query:', sparqlErr);
    }
  }

  // Guaranteed fallback: If contributions were empty, generate structured comparison entry from metadata
  if (paperMap.size === 0) {
    paperMap.set(comparisonId, {
      id: comparisonId,
      name: title,
      properties: {
        'Research Scope':
          description || 'Comparative analysis extracted from ORKG.',
        'Knowledge Graph Entity': `https://orkg.org/comparison/${comparisonId}`,
      },
    });
    propOrder.push('Research Scope', 'Knowledge Graph Entity');
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

  const propertyColumns = propOrder.length > 0 ? propOrder : ['Evaluation'];

  const headerRow = ['Study / Method', ...propertyColumns];
  const sepRow = headerRow.map(() => '---');
  const tableRows = contributions.map((c) => {
    const cells = propertyColumns.map((prop) =>
      cleanCell(c.properties[prop] || '—', 60)
    );
    return `| ${cleanCell(c.name, 45)} | ${cells.join(' | ')} |`;
  });

  const markdownTable = [
    `| ${headerRow.join(' | ')} |`,
    `| ${sepRow.join(' | ')} |`,
    ...tableRows,
  ].join('\n');

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
    if (s.status === 'fulfilled' && s.value) {
      results.push(s.value);
    }
  }
  return results;
}
