'use server';

import ky from 'ky';

const ORKG_API_BASE = 'https://orkg.org/api';
const ORKG_SPARQL_ENDPOINT = 'https://orkg.org/sparql';

export type OrkgProblem = {
  id: string; // e.g. R1234
  label: string;
  description?: string;
  subProblems?: string[];
};

export type OrkgBenchmarkSummary = {
  problemId: string;
  problemTitle: string;
  comparisons: Array<{
    id: string;
    title: string;
    contributionCount?: number;
  }>;
  datasets: string[];
  metrics: string[];
};

/**
 * Searches real ORKG problems directly via ORKG class resources API
 */
export async function searchDirectOrkgProblems(
  query: string
): Promise<OrkgProblem[]> {
  const clean = query.trim();
  if (!clean) return [];

  try {
    // In ORKG, problems are resources with class 'Problem'
    const response = await ky
      .get(`${ORKG_API_BASE}/classes/Problem/resources`, {
        searchParams: {
          q: clean,
          exact: false,
          size: 8,
        },
        timeout: 10000,
      })
      .json<{
        content?: Array<{ id: string; label: string }>;
      }>();

    const items = response?.content || [];

    // If the specific class search yielded few results, fallback to broad resource query
    if (items.length === 0) {
      const fallback = await ky
        .get(`${ORKG_API_BASE}/resources`, {
          searchParams: {
            q: clean,
            exact: false,
            size: 8,
          },
          timeout: 10000,
        })
        .json<{ content?: Array<{ id: string; label: string }> }>();

      return (fallback?.content || []).map((r) => ({
        id: r.id,
        label: r.label,
      }));
    }

    return items.map((p) => ({
      id: p.id,
      label: p.label,
    }));
  } catch (error) {
    console.error('Error fetching directly from ORKG API:', error);
    return [];
  }
}

/**
 * Retrieves the full graph of comparisons, datasets, and benchmark properties
 * directly from the ORKG Virtuoso SPARQL endpoint for a given problem
 */
export async function getOrkgProblemGraph(
  problemId: string
): Promise<OrkgBenchmarkSummary | null> {
  const cleanId = problemId.replace(/[^a-zA-Z0-9_-]/g, '');

  const sparql = `
PREFIX orkgr: <http://orkg.org/orkg/resource/>
PREFIX orkgp: <http://orkg.org/orkg/predicate/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?problemLabel ?comparison ?compTitle ?predicateLabel ?valLabel
WHERE {
  orkgr:${cleanId} rdfs:label ?problemLabel .
  OPTIONAL {
    ?contribution orkgp:P32 orkgr:${cleanId} .
    ?comparison ?hasContrib ?contribution .
    OPTIONAL { ?comparison rdfs:label ?compTitle }
    OPTIONAL {
      ?contribution ?predicate ?value .
      ?predicate rdfs:label ?predicateLabel .
      OPTIONAL { ?value rdfs:label ?valLabel }
    }
  }
} LIMIT 120`;

  try {
    const sparqlResponse = await ky
      .post(ORKG_SPARQL_ENDPOINT, {
        headers: {
          Accept: 'application/sparql-results+json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ query: sparql }).toString(),
        timeout: 15000,
      })
      .json<{
        results: {
          bindings: Array<{
            problemLabel?: { value: string };
            comparison?: { value: string };
            compTitle?: { value: string };
            predicateLabel?: { value: string };
            valLabel?: { value: string };
          }>;
        };
      }>();

    const bindings = sparqlResponse?.results?.bindings || [];
    let problemTitle = cleanId;

    const compMap = new Map<string, string>();
    const metricsSet = new Set<string>();
    const datasetsSet = new Set<string>();

    for (const b of bindings) {
      if (b.problemLabel?.value) {
        problemTitle = b.problemLabel.value;
      }
      if (b.comparison?.value) {
        const cId = b.comparison.value.split('/').pop() || '';
        const cTitle = b.compTitle?.value || `Comparison ${cId}`;
        compMap.set(cId, cTitle);
      }
      if (b.predicateLabel?.value) {
        const pred = b.predicateLabel.value.trim();
        const predLower = pred.toLowerCase();
        if (
          predLower.includes('metric') ||
          predLower.includes('accuracy') ||
          predLower.includes('f1') ||
          predLower.includes('score') ||
          predLower.includes('bleu') ||
          predLower.includes('error')
        ) {
          metricsSet.add(pred);
        } else if (
          predLower.includes('dataset') ||
          predLower.includes('benchmark') ||
          predLower.includes('corpus')
        ) {
          if (b.valLabel?.value) datasetsSet.add(b.valLabel.value.trim());
          else datasetsSet.add(pred);
        }
      }
    }

    return {
      problemId: cleanId,
      problemTitle,
      comparisons: Array.from(compMap.entries()).map(([id, title]) => ({
        id,
        title,
      })),
      datasets: Array.from(datasetsSet).slice(0, 8),
      metrics: Array.from(metricsSet).slice(0, 8),
    };
  } catch (err) {
    console.error('Error fetching ORKG problem graph via SPARQL:', err);
    return null;
  }
}
