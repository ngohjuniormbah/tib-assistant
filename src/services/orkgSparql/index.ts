'use server';

import ky from 'ky';

import { generateText } from '@/lib/llm';
import { openai } from '@/lib/openAi';

export type OrkgNlQueryResult = {
  naturalLanguageResponse: string;
  sparqlQuery: string;
  resultCount: number;
};

type OrkgResource = {
  id: string;
  label?: string;
  classes?: string[];
};

type OrkgComparison = {
  id: string;
  title?: string;
  label?: string;
  description?: string;
};

type OrkgPageResponse<T> = {
  content?: T[];
};

function extractKeywords(query: string): string {
  const stopwords = new Set([
    'find',
    'search',
    'show',
    'what',
    'are',
    'the',
    'in',
    'of',
    'on',
    'for',
    'with',
    'about',
    'which',
    'give',
    'me',
    'list',
    'tell',
    'papers',
    'studies',
    'comparisons',
  ]);
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w));
  return tokens.join(' ') || query;
}

export async function queryOrkgWithNl(
  query: string
): Promise<OrkgNlQueryResult> {
  const searchTerms = extractKeywords(query);
  const q = encodeURIComponent(searchTerms.trim());

  let resources: OrkgResource[] = [];
  let comparisons: OrkgComparison[] = [];

  try {
    const [resResult, compResult] = await Promise.allSettled([
      ky
        .get(`https://orkg.org/api/resources?q=${q}&size=8`, { timeout: 12000 })
        .json<OrkgPageResponse<OrkgResource> | OrkgResource[]>(),
      ky
        .get(`https://orkg.org/api/comparisons?q=${q}&size=5`, {
          timeout: 12000,
        })
        .json<OrkgPageResponse<OrkgComparison> | OrkgComparison[]>(),
    ]);

    if (resResult.status === 'fulfilled' && resResult.value) {
      const val = resResult.value;
      resources = Array.isArray(val) ? val : val.content || [];
    }
    if (compResult.status === 'fulfilled' && compResult.value) {
      const val = compResult.value;
      comparisons = Array.isArray(val) ? val : val.content || [];
    }
  } catch (err) {
    console.warn('ORKG Search error:', err);
  }

  const allEntries: string[] = [];

  if (Array.isArray(comparisons) && comparisons.length > 0) {
    allEntries.push('### ORKG Comparison Tables:');
    comparisons.forEach((c, i) => {
      allEntries.push(
        `${i + 1}. **[${c.title || c.label || 'Comparison'}](https://orkg.org/comparison/${c.id})** (ID: \`${c.id}\`)`
      );
      if (c.description) allEntries.push(`   *Summary:* ${c.description}`);
    });
  }

  if (Array.isArray(resources) && resources.length > 0) {
    allEntries.push('### ORKG Resources & Papers:');
    resources.forEach((r, i) => {
      const classes = (r.classes || []).join(', ');
      allEntries.push(
        `${i + 1}. [${r.label || 'Resource'}](https://orkg.org/resource/${r.id}) (ID: \`${r.id}\`${classes ? ` | Type: ${classes}` : ''})`
      );
    });
  }

  if (allEntries.length > 0) {
    const contextPrompt = `User question: "${query}"\n\nRelevant ORKG search results:\n${allEntries.join('\n')}\n\nSynthesize a scholarly, structured academic response directly answering the user query based on the ORKG items found. Provide direct markdown links to the ORKG resources and comparisons. Highlight existing comparison tables that the user can import.`;

    try {
      const aiResponse = await generateText({
        model: openai('gpt-4o-mini'),
        system:
          'You are an expert scientific researcher at TIB summarizing the Open Research Knowledge Graph (ORKG). Present clear, rigorous academic summaries without decorative emojis.',
        prompt: contextPrompt,
      });

      return {
        naturalLanguageResponse: aiResponse?.text ?? allEntries.join('\n'),
        sparqlQuery: `# ORKG Keyword Search for "${searchTerms}"`,
        resultCount: allEntries.length,
      };
    } catch {
      return {
        naturalLanguageResponse: allEntries.join('\n'),
        sparqlQuery: `# ORKG Keyword Search for "${searchTerms}"`,
        resultCount: allEntries.length,
      };
    }
  }

  return {
    naturalLanguageResponse: `No direct entries found in ORKG for "${query}". Try searching by specific scientific terminology, model names, or benchmark datasets.`,
    sparqlQuery: `# Search executed for "${searchTerms}"`,
    resultCount: 0,
  };
}
