import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Pagination, ScrollShadow } from '@heroui/react';
import { times } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import { getPaginationItems } from '@/components/SearchFilter/getPaginationItems';
import PaperListItem from '@/components/ToolCallPaper/PaperList/PaperListItem/PaperListItem';

export type PaperItem = {
  id: string | number;
  title?: string;
  authors?: string[] | null;
  publicationDate?: Date | null;
  doi?: string | null;
  link?: string;
  abstract?: string | null;
};

type Props = {
  papers?: PaperItem[];
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  isLoading: boolean;
  storeItem: string[];
  setStoreItem: (value: string[]) => Promise<void>;
};

export default function PaperList({
  papers,
  page,
  setPage,
  totalPages,
  isLoading,
  storeItem,
  setStoreItem,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePaginationChange = (page: number) => {
    setPage(page);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const lastPage = totalPages > 30 ? 30 : totalPages;
  const paginationItems = getPaginationItems(page, lastPage);

  return (
    <div
      className={`${
        isExpanded
          ? 'fixed inset-0 bg-surface-secondary z-50 p-4 w-screen h-screen top-0 left-0 flex flex-col'
          : ''
      }`}
    >
      <ScrollShadow
        className={`my-4 overflow-y-auto ${
          !isExpanded ? 'max-h-[500px]' : 'grow'
        }`}
        ref={containerRef}
      >
        {/* v3 ScrollShadow is div-only, so the list element lives inside it. */}
        <ul className="flex flex-col gap-2">
          {!isLoading &&
            papers &&
            papers.map((paper) => (
              <PaperListItem
                paper={paper}
                key={paper.id}
                storeItem={storeItem}
                setStoreItem={setStoreItem}
              />
            ))}
          {isLoading &&
            times(10).map((i) => <PaperListItem isLoading key={i} />)}
        </ul>
      </ScrollShadow>
      <div className="flex justify-between">
        <div>
          {/* v3 Pagination no longer derives page items from `total`; the
              windowed range plus prev/next controls are composed here. */}
          {papers && (
            <Pagination aria-label="Pagination">
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous
                    isDisabled={page <= 1}
                    onPress={() => handlePaginationChange(page - 1)}
                  >
                    <Pagination.PreviousIcon />
                  </Pagination.Previous>
                </Pagination.Item>
                {paginationItems.map((paginationItem, index) =>
                  paginationItem === 'ellipsis' ? (
                    <Pagination.Item key={`ellipsis-${index}`}>
                      <Pagination.Ellipsis />
                    </Pagination.Item>
                  ) : (
                    <Pagination.Item key={paginationItem}>
                      <Pagination.Link
                        isActive={paginationItem === page}
                        onPress={() => handlePaginationChange(paginationItem)}
                      >
                        {paginationItem}
                      </Pagination.Link>
                    </Pagination.Item>
                  )
                )}
                <Pagination.Item>
                  <Pagination.Next
                    isDisabled={page >= lastPage}
                    onPress={() => handlePaginationChange(page + 1)}
                  >
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          )}
        </div>
        <Button isIconOnly onPress={() => setIsExpanded((v) => !v)}>
          <FontAwesomeIcon icon={faExpand} />
        </Button>
      </div>
    </div>
  );
}
