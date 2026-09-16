import { useState } from 'react';
import useSWR from 'swr';

import ExpandableMessage from '@/components/ExpandableMessage/ExpandableMessage';
import ToolCallPaper from '@/components/ToolCallPaper/ToolCallPaper';
import useIndexedDbStore from '@/components/useIndexedDbStore/useIndexedDbStore';
import { searchPapers, semanticScholarApi } from '@/services/semanticScholar';

type Props = {
  input?: { keywords?: string };
};

export default function SemanticScholarLookup({ input }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const { asset: bibliography, update } = useIndexedDbStore({
    assetId: 'bibliography',
  });
  const { data, isLoading } = useSWR(
    isExpanded && input?.keywords
      ? [{ query: input.keywords, page }, semanticScholarApi, 'searchItems']
      : null,
    ([params]) =>
      searchPapers({
        query: params.query,
        limit,
        offset: (params.page - 1) * limit,
      })
  );

  return (
    <ExpandableMessage
      title="Semantic Scholar lookup"
      content={
        <ToolCallPaper
          papers={
            data?.data?.map((item) => ({
              id: `semanticScholar-${item.paperId}`,
              title: item.title,
              link: item.url,
              doi: item.doi,
              authors: item.authors.map((author) => author.name),
              abstract: item.abstract,
            })) ?? []
          }
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
      isExpanded={isExpanded}
      setIsExpanded={setIsExpanded}
    />
  );
}
