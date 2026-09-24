'use client';

import { Label, ListBox, Pagination, Select } from '@heroui/react';

import { getPaginationItems } from '@/components/SearchFilter/getPaginationItems';

type SearchFilterPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  totalCount: number;
};

// HeroUI Pagination becomes unwieldy with a very large number of pages; cap the
// rendered range the same way PaperList does.
const MAX_RENDERED_PAGES = 30;

export default function SearchFilterPagination({
  page,
  totalPages,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  totalCount,
}: SearchFilterPaginationProps) {
  const cappedTotalPages = Math.min(totalPages, MAX_RENDERED_PAGES);
  const paginationItems = getPaginationItems(page, cappedTotalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* v3 Pagination no longer derives page items from `total`; the windowed
          range plus prev/next controls are composed here. */}
      <Pagination aria-label="Pagination">
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous
              isDisabled={page <= 1}
              onPress={() => onPageChange(page - 1)}
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
                  onPress={() => onPageChange(paginationItem)}
                >
                  {paginationItem}
                </Pagination.Link>
              </Pagination.Item>
            )
          )}
          <Pagination.Item>
            <Pagination.Next
              isDisabled={page >= cappedTotalPages}
              onPress={() => onPageChange(page + 1)}
            >
              <Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted">
          {totalCount.toLocaleString()} items
        </span>
        <Select
          className="w-[110px]"
          selectedKey={String(pageSize)}
          onSelectionChange={(key) => onPageSizeChange(Number(key))}
        >
          <Label>Items</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {pageSizeOptions.map((option) => (
                <ListBox.Item
                  key={String(option)}
                  id={String(option)}
                  textValue={String(option)}
                >
                  {String(option)}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
    </div>
  );
}
