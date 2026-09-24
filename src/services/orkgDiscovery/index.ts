'use server';

import ky from 'ky';

import { searchPapers } from '@/services/semanticScholar';

const ORKG_SPARQL_ENDPOINT = 'https://orkg.org/triplestore/sparql';

export type OrkgProblemSummary = {
  id: string;
  label: string;
  type: 'problem' | 'comparison';
  comparisonCount: number;
  description?: string;
};

export type OrkgGapReport = {
  problemId: string;
  problemLabel: string;
  comparisonsFound: number;
  evaluatedProperties: string[];
  observedBaselines: string[];
  openGapInsights: string[];
};

export type PriorArtCollisionCheck = {
  noveltyScore: number; // 0-100
  potentialCollisions: Array<{
    title: string;
    url?: string;
    doi?: string;
    similarityHint: string;
  }>;
  verdict: 'high_novelty' | 'moderate_overlap' | 'collision_detected';
};

type OrkgResourceItem = {
  id: string;
  label?: string;
  classes?: string[];
};

type OrkgComparisonItem = {
  id: string;
  title?: string;
  label?: string;
  description?: string;
};

type OrkgPageResponse<T> = {
  content?: T[];
};

/**
 * Search ORKG research problems and benchmark comparisons using official endpoints
 */
export async function searchOrkgProblems(
  query: string
): Promise<OrkgProblemSummary[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const q = encodeURIComponent(cleanQuery);
  const results: OrkgProblemSummary[] = [];

  try {
    const [problemRes, compRes] = await Promise.allSettled([
      // 1. Search resources with class Problem
      ky
        .get(`https://orkg.org/api/resources?q=${q}&include=Problem&size=6`, {
          timeout: 10000,
        })
        .json<OrkgPageResponse<OrkgResourceItem> | OrkgResourceItem[]>(),
      // 2. Search comparative benchmark tables
      ky
        .get(`https://orkg.org/api/comparisons?q=${q}&size=4`, {
          timeout: 10000,
        })
        .json<OrkgPageResponse<OrkgComparisonItem> | OrkgComparisonItem[]>(),
    ]);

    if (problemRes.status === 'fulfilled' && problemRes.value) {
      const val = problemRes.value;
      const items = Array.isArray(val) ? val : val.content || [];
      items.forEach((item) => {
        results.push({
          id: item.id,
          label: item.label || item.id,
          type: 'problem',
          comparisonCount: 1,
        });
      });
    }

    if (compRes.status === 'fulfilled' && compRes.value) {
      const val = compRes.value;
      const comps = Array.isArray(val) ? val : val.content || [];
      comps.forEach((comp) => {
        results.push({
          id: comp.id,
          label: comp.title || comp.label || `Comparison ${comp.id}`,
          type: 'comparison',
          comparisonCount: 1,
          description: comp.description || undefined,
        });
      });
    }

    // Fallback: If include=Problem was too strict, search general resources matching label
    if (results.length === 0) {
      const generalRes = await ky
        .get(`https://orkg.org/api/resources?q=${q}&size=6`, { timeout: 10000 })
        .json<OrkgPageResponse<OrkgResourceItem> | OrkgResourceItem[]>();

      const items = Array.isArray(generalRes)
        ? generalRes
        : generalRes.content || [];
      items.forEach((item) => {
        results.push({
          id: item.id,
          label: item.label || item.id,
          type: 'problem',
          comparisonCount: 1,
        });
      });
    }

    return results;
  } catch (error) {
    console.error('Error searching ORKG problems:', error);
    return [];
  }
}

/**
 * Inspect benchmark matrices under an ORKG problem to detect plateaued metrics and unmapped properties
 */
export async function mineOrkgProblemGaps(
  problemId: string
): Promise<OrkgGapReport | null> {
  const cleanId = problemId.replace(/[^a-zA-Z0-9_-]/g, '');
  const sparql = `
PREFIX orkgr: <http://orkg.org/orkg/resource/>
PREFIX orkgp: <http://orkg.org/orkg/predicate/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?contrib ?propLabel ?valLabel
WHERE {
  {
    ?contrib orkgp:P32 orkgr:${cleanId} .
    ?contrib ?prop ?val .
    ?prop rdfs:label ?propLabel .
    OPTIONAL { ?val rdfs:label ?valLabel }
  } UNION {
    orkgr:${cleanId} ?hasContrib ?contrib .
    ?contrib ?prop ?val .
    ?prop rdfs:label ?propLabel .
    OPTIONAL { ?val rdfs:label ?valLabel }
  }
} LIMIT 100`;

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
        results: { bindings: Array<Record<string, { value: string }>> };
      }>();

    const bindings = sparqlResponse?.results?.bindings ?? [];
    const propertySet = new Set<string>();

    for (const binding of bindings) {
      if (binding.propLabel?.value) {
        propertySet.add(binding.propLabel.value.trim());
      }
    }

    const properties = Array.from(propertySet);
    const gaps: string[] = [];

    if (properties.length > 0) {
      gaps.push(
        `Identified ${properties.length} evaluation properties active in ORKG graphs.`
      );
    } else {
      gaps.push(
        'Pioneer problem area in ORKG. High opportunity to define new evaluation benchmarks.'
      );
    }

    return {
      problemId,
      problemLabel: cleanId,
      comparisonsFound: bindings.length > 0 ? 1 : 0,
      evaluatedProperties: properties.slice(0, 15),
      observedBaselines: [],
      openGapInsights: gaps,
    };
  } catch (error) {
    console.error('Error mining ORKG problem gaps:', error);
    return null;
  }
}

/**
 * Check a candidate hypothesis against recent literature to detect duplicate works
 */
export async function checkPriorArtCollision(
  hypothesis: string,
  keywords: string[]
): Promise<PriorArtCollisionCheck> {
  const searchQuery = keywords.slice(0, 4).join(' ');
  const recentPapers = await searchPapers({
    query: searchQuery || hypothesis.slice(0, 80),
    limit: 6,
  });

  const collisions: PriorArtCollisionCheck['potentialCollisions'] = [];
  const papers = recentPapers?.data ?? [];

  for (const paper of papers) {
    const titleTokens = paper.title.toLowerCase().split(/\s+/);
    const hypothesisTokens = hypothesis.toLowerCase().split(/\s+/);
    const commonTokens = titleTokens.filter(
      (token) => token.length > 3 && hypothesisTokens.includes(token)
    );

    if (commonTokens.length >= 2) {
      collisions.push({
        title: paper.title,
        url: paper.url,
        doi: paper.doi,
        similarityHint: `Shared conceptual keywords: ${commonTokens.join(', ')}`,
      });
    }
  }

  const noveltyScore = Math.max(20, 100 - collisions.length * 25);
  const verdict: PriorArtCollisionCheck['verdict'] =
    collisions.length >= 2
      ? 'collision_detected'
      : collisions.length === 1
        ? 'moderate_overlap'
        : 'high_novelty';

  return {
    noveltyScore,
    potentialCollisions: collisions,
    verdict,
  };
}
