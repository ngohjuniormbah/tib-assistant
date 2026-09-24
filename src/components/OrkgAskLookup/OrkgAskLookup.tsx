import { useState } from 'react';
import useSWR from 'swr';

import ExpandableMessage from '@/components/ExpandableMessage/ExpandableMessage';
import ToolCallPaper from '@/components/ToolCallPaper/ToolCallPaper';
import useIndexedDbStore from '@/components/useIndexedDbStore/useIndexedDbStore';
import { orkgAskApi, searchItems } from '@/services/orkgAsk';

type Props = {
  input?: { query?: string };
  output?: unknown;
};

export default function OrkgAskLookup({ input }: Props) {
  const query = input?.query;
  const { asset: researchQuestions } = useIndexedDbStore({
    assetId: 'researchQuestions',
  });

  let lookupHint = '';

  if (input?.query && researchQuestions && query) {
    const index = researchQuestions.findIndex(
      (question) => question.includes(query) || query.includes(question)
    );
    if (index !== -1) {
      lookupHint = `RQ${index + 1}. `;
    }
  }

  const [page, setPage] = useState(1);
  const limit = 10;
  const { asset: bibliography, update } = useIndexedDbStore({
    assetId: 'bibliography',
  });

  const { data, isLoading } = useSWR(
    query ? [{ query, page }, orkgAskApi, 'searchItems'] : null,
    ([params]) =>
      searchItems({ query: params.query, limit, offset: params.page * limit })
  );

  return (
    <ExpandableMessage
      title={`${lookupHint}ORKG Ask lookup`}
      query={query}
      content={
        <ToolCallPaper
          papers={data?.items.map((item) => ({
            id: `orkgAsk-${item.id}`,
            title: item.title,
            link: `https://ask.orkg.org/item/${item.id}`,
            publicationDate: item.date_published
              ? new Date(item.date_published)
              : null,
            doi: item.doi,
            authors: item.authors,
            abstract: item.abstract,
          }))}
          page={page}
          setPage={setPage}
          totalPages={data?.total_hits ? data?.total_hits / limit : 10}
          isLoading={isLoading}
          storeItem={bibliography ?? []}
          setStoreItem={update}
          input={input}
        />
      }
      onDelete={() => {}}
    />
  );
}
