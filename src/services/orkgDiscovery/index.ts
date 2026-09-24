'use server';

import ky from 'ky';

import { searchPapers } from '@/services/semanticScholar';

const ORKG_SPARQL_ENDPOINT = 'https://orkg.org/triplestore/sparql';

export type OrkgProblemSummary = {
  id: string;
  label: string;
  comparisonCount: number;
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

/**
 * Search ORKG research problems by keyword
 */
export async function searchOrkgProblems(
  query: string
): Promise<OrkgProblemSummary[]> {
  try {
    const response = await ky
      .get(
        `https://orkg.org/api/problems?q=${encodeURIComponent(query.trim())}&size=6`,
        {
          timeout: 10000,
        }
      )
      .json<{ content?: Array<{ id: string; label: string }> }>();

    const problems = response?.content ?? [];
    return problems.map((problem) => ({
      id: problem.id,
      label: problem.label,
      comparisonCount: 1,
    }));
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

SELECT DISTINCT ?comparison ?comparisonTitle ?propLabel ?valLabel
WHERE {
  ?comparison orkgp:P32 orkgr:${cleanId} .
  OPTIONAL { ?comparison rdfs:label ?comparisonTitle }
  OPTIONAL {
    ?comparison ?hasContrib ?contrib .
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
    const comparisonSet = new Set<string>();

    for (const binding of bindings) {
      if (binding.comparison?.value) {
        comparisonSet.add(binding.comparison.value);
      }
      if (binding.propLabel?.value) {
        propertySet.add(binding.propLabel.value.trim());
      }
    }

    const properties = Array.from(propertySet);
    const gaps: string[] = [];

    if (properties.length > 0) {
      gaps.push(
        `Identified ${properties.length} active benchmark properties across ${comparisonSet.size} comparisons.`
      );
    } else {
      gaps.push(
        'Limited structured comparison tables detected in ORKG; high potential for pioneer benchmark.'
      );
    }

    return {
      problemId,
      problemLabel: cleanId,
      comparisonsFound: comparisonSet.size,
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
    limit: 5,
  });

  const collisions: PriorArtCollisionCheck['potentialCollisions'] = [];
  const papers = recentPapers?.data ?? [];

  for (const paper of papers) {
    const titleTokens = paper.title.toLowerCase().split(/\s+/);
    const hypothesisTokens = hypothesis.toLowerCase().split(/\s+/);
    const commonTokens = titleTokens.filter(
      (token) => token.length > 3 && hypothesisTokens.includes(token)
    );

    if (commonTokens.length >= 3) {
      collisions.push({
        title: paper.title,
        url: paper.url,
        doi: paper.doi,
        similarityHint: `Overlapping conceptual tokens: ${commonTokens.join(', ')}`,
      });
    }
  }

  const noveltyScore = Math.max(15, 100 - collisions.length * 28);
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
