'use server';

import ky from 'ky';

import { generateText } from '@/lib/llm';
import { openai } from '@/lib/openAi';
import { searchItems } from '@/services/orkgAsk';

export type OrkgNlQueryResult = {
  naturalLanguageResponse: string;
  sparqlQuery: string;
  resultCount: number;
};

export async function queryOrkgWithNl(
  query: string
): Promise<OrkgNlQueryResult> {
  const cleanQuery = query.trim();
  const allEntries: string[] = [];

  try {
    // 1. Query ORKG Ask semantic vector index
    const askResults = await searchItems({
      query: cleanQuery,
      limit: 6,
      offset: 0,
    });
    const items = askResults?.items || [];

    if (items.length > 0) {
      allEntries.push('### ORKG Papers & Items:');
      items.forEach((item, i) => {
        const year = item.date_published
          ? new Date(item.date_published).getFullYear()
          : '';
        const authorStr = item.authors?.slice(0, 2).join(', ') || '';
        allEntries.push(
          `${i + 1}. **[${item.title}](https://ask.orkg.org/item/${item.id})** ${year ? `(${year})` : ''}${authorStr ? ` — ${authorStr}` : ''}`
        );
        if (item.abstract) {
          allEntries.push(`   *Summary:* ${item.abstract.slice(0, 180)}…`);
        }
      });
    }

    // 2. Query ORKG Resources API for problem / comparison entities
    const resourceRes = await ky
      .get(
        `https://orkg.org/api/resources?q=${encodeURIComponent(cleanQuery)}&size=6`,
        { timeout: 10000 }
      )
      .json<
        | { content?: Array<{ id: string; label: string; classes?: string[] }> }
        | Array<{ id: string; label: string; classes?: string[] }>
      >();

    const resources = Array.isArray(resourceRes)
      ? resourceRes
      : resourceRes?.content || [];
    const validResources = resources.filter(
      (r) => r.label && r.label.toLowerCase() !== cleanQuery.toLowerCase()
    );

    if (validResources.length > 0) {
      allEntries.push('\n### ORKG Knowledge Graph Entities:');
      validResources.slice(0, 5).forEach((r, i) => {
        const typeStr = r.classes?.join(', ') || 'Entity';
        allEntries.push(
          `${i + 1}. [${r.label}](https://orkg.org/resource/${r.id}) (ID: \`${r.id}\` | Type: ${typeStr})`
        );
      });
    }
  } catch (err) {
    console.warn('Notice from ORKG search query:', err);
  }

  if (allEntries.length > 0) {
    try {
      const contextPrompt = `User question: "${cleanQuery}"\n\nScholarly items from ORKG:\n${allEntries.join('\n')}\n\nSynthesize an authoritative, structured academic response directly answering the user query. Reference the papers and link to the ORKG resources.`;

      const aiResponse = await generateText({
        model: openai('gpt-4o-mini'),
        system:
          'You are an elite scientific researcher at the Leibniz Information Centre for Science and Technology (TIB) synthesizing the Open Research Knowledge Graph (ORKG). Provide concise, technical academic responses with markdown links.',
        prompt: contextPrompt,
      });

      return {
        naturalLanguageResponse: aiResponse?.text || allEntries.join('\n'),
        sparqlQuery: `# ORKG Query for "${cleanQuery}"`,
        resultCount: allEntries.length,
      };
    } catch {
      return {
        naturalLanguageResponse: allEntries.join('\n'),
        sparqlQuery: `# ORKG Query for "${cleanQuery}"`,
        resultCount: allEntries.length,
      };
    }
  }

  return {
    naturalLanguageResponse: `No direct entries found in ORKG for "${cleanQuery}". Try related scientific terms, model names, or benchmark datasets.`,
    sparqlQuery: `# Query executed for "${cleanQuery}"`,
    resultCount: 0,
  };
}
