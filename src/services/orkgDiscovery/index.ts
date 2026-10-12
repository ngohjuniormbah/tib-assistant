'use server';

import { searchCrossrefWorks } from '@/services/crossref';
import { searchDirectOrkgProblems } from '@/services/orkgClient';
import { searchPapers } from '@/services/semanticScholar';

export type DetectedPriorArt = {
  title: string;
  source: 'Semantic Scholar' | 'Crossref' | 'ORKG Knowledge Graph';
  venue?: string;
  year?: number | string;
  url?: string;
  doi?: string;
  similarityHint: string;
};

export type PriorArtCollisionCheck = {
  noveltyScore: number; // 0-100
  potentialCollisions: DetectedPriorArt[];
  verdict: 'high_novelty' | 'moderate_overlap' | 'collision_detected';
  sourcesChecked: string[];
  totalCandidatesScanned: number;
};

/**
 * Cross-examines Semantic Scholar, Crossref publisher proceedings, and ORKG
 * to detect prior art collisions and compute a novelty score
 */
export async function checkPriorArtCollision(
  hypothesis: string,
  keywords: string[]
): Promise<PriorArtCollisionCheck> {
  const searchQuery = keywords.slice(0, 4).join(' ') || hypothesis.slice(0, 80);
  const collisions: DetectedPriorArt[] = [];
  const sourcesChecked: string[] = [
    'Semantic Scholar (200M+ papers & citation graph)',
    'Crossref (IEEE, ACM, Springer, Nature proceedings)',
    'Open Research Knowledge Graph (ORKG live triplestore)',
  ];

  const [s2Res, crossrefRes, orkgRes] = await Promise.allSettled([
    searchPapers({ query: searchQuery, limit: 6 }),
    searchCrossrefWorks({ query: searchQuery, rows: 5 }),
    searchDirectOrkgProblems(searchQuery),
  ]);

  const hypothesisLower = hypothesis.toLowerCase();
  const keyTokens = keywords
    .map((k) => k.toLowerCase().trim())
    .filter((k) => k.length > 2);

  // 1. Process Semantic Scholar results
  let scannedCount = 0;
  if (s2Res.status === 'fulfilled' && s2Res.value?.data) {
    const s2Papers = s2Res.value.data;
    scannedCount += s2Papers.length;

    for (const paper of s2Papers) {
      const titleLower = paper.title.toLowerCase();
      const matchedKeywords = keyTokens.filter(
        (kw) => titleLower.includes(kw) || hypothesisLower.includes(kw)
      );

      if (
        matchedKeywords.length >= 2 ||
        (matchedKeywords.length >= 1 && keyTokens.length <= 2)
      ) {
        collisions.push({
          title: paper.title,
          source: 'Semantic Scholar',
          year: paper.year ?? undefined,
          url: paper.url,
          doi: paper.doi ?? undefined,
          similarityHint: `Conceptual match on [${matchedKeywords.join(', ')}]`,
        });
      }
    }
  }

  // 2. Process Crossref results (Conference & Publisher Proceedings)
  if (crossrefRes.status === 'fulfilled' && crossrefRes.value) {
    const crWorks = crossrefRes.value;
    scannedCount += crWorks.length;

    for (const work of crWorks) {
      const titleLower = work.title.toLowerCase();
      const matchedKeywords = keyTokens.filter((kw) => titleLower.includes(kw));

      if (matchedKeywords.length >= 2) {
        // avoid exact duplicates from S2
        if (!collisions.some((c) => c.title.toLowerCase() === titleLower)) {
          collisions.push({
            title: work.title,
            source: 'Crossref',
            venue: work.venue,
            year: work.year,
            url: work.url,
            doi: work.doi,
            similarityHint: `Published venue match: ${work.venue || 'Proceedings'} (${matchedKeywords.join(', ')})`,
          });
        }
      }
    }
  }

  // 3. Process ORKG Knowledge Graph results
  if (orkgRes.status === 'fulfilled' && orkgRes.value) {
    const orkgProblems = orkgRes.value;
    scannedCount += orkgProblems.length;

    for (const p of orkgProblems) {
      const labelLower = p.label.toLowerCase();
      const matchedKeywords = keyTokens.filter((kw) => labelLower.includes(kw));

      if (matchedKeywords.length >= 1) {
        collisions.push({
          title: `ORKG Problem Graph: ${p.label}`,
          source: 'ORKG Knowledge Graph',
          url: `https://orkg.org/resource/${p.id}`,
          similarityHint: `Existing benchmark problem in ORKG (${p.id})`,
        });
      }
    }
  }

  // Calculate Novelty Score %
  let noveltyScore = 95;
  if (collisions.length >= 3) {
    noveltyScore = Math.max(25, 100 - collisions.length * 20);
  } else if (collisions.length === 2) {
    noveltyScore = 65;
  } else if (collisions.length === 1) {
    noveltyScore = 80;
  }

  const verdict: PriorArtCollisionCheck['verdict'] =
    collisions.length >= 3
      ? 'collision_detected'
      : collisions.length >= 1
        ? 'moderate_overlap'
        : 'high_novelty';

  return {
    noveltyScore,
    potentialCollisions: collisions.slice(0, 6),
    verdict,
    sourcesChecked,
    totalCandidatesScanned: scannedCount,
  };
}
