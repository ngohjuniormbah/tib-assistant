'use server';

import ky from 'ky';

const SPARQL_ENDPOINT = 'https://orkg.org/triplestore/sparql';

async function callOpenAi(prompt: string, maxTokens = 1200): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured in .env.local');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'system',
          content: 'You are an academic assistant summarizing ORKG research knowledge. Do not use decorative icons or emojis in your responses. Output clean, structured markdown.',
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content ?? '').trim();
}

async function searchOrkgApi(query: string): Promise<any[]> {
  try {
    const q = encodeURIComponent(query.trim());
    const res = await ky.get(`https://orkg.org/api/resources?q=${q}&size=10`, { timeout: 15000 }).json<any>();
    const items = res.content || res || [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export type OrkgNlQueryResult = {
  naturalLanguageResponse: string;
  sparqlQuery: string;
  resultCount: number;
};

export async function queryOrkgWithNl(query: string): Promise<OrkgNlQueryResult> {
  // 1. Search ORKG Resources / Papers / Comparisons
  const searchResults = await searchOrkgApi(query);
  
  if (searchResults.length > 0) {
    const lines = searchResults.map((it: any, i: number) => {
      const id = it.id;
      const label = it.label || 'Untitled';
      const classes = (it.classes || []).join(', ');
      return `${i + 1}. [${label}](https://orkg.org/resource/${id}) (ID: ${id}${classes ? `, Type: ${classes}` : ''})`;
    }).join('\n');

    const naturalLanguageResponse = await callOpenAi(
      `The user searched ORKG for: "${query}"\n\nMatching ORKG entries found:\n${lines}\n\nProvide a clean, direct academic summary answering the user query. Include markdown links to the ORKG resources. Do not use emojis.`
    );

    return {
      naturalLanguageResponse,
      sparqlQuery: `# ORKG REST Search for "${query}"`,
      resultCount: searchResults.length,
    };
  }

  return {
    naturalLanguageResponse: `No results found in ORKG for "${query}". Try searching by paper title, author, or research field keyword.`,
    sparqlQuery: `# Search executed for "${query}"`,
    resultCount: 0,
  };
}
