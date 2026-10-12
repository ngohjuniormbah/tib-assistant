import { useMemo, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

export type FilterDefinition<T> = {
  key: string; // e.g. 'domain' | 'lifeCyclePhase'
  label: string; // e.g. 'Field' | 'Phase'
  allOptionLabel: string; // e.g. 'All fields' | 'All phases'
  getValue: (item: T) => string | undefined;
};

export type SortDefinition<T> = {
  key: string; // e.g. 'name-asc'
  label: string; // e.g. 'Name A-Z'
  compare: (a: T, b: T) => number;
};

export type FilterControl = {
  key: string;
  label: string;
  allOptionLabel: string;
  options: string[]; // unique values present, sorted
  selectedValue: string; // '' = All
  onChange: (value: string) => void;
};

export type UseSearchFilterParams<T> = {
  items: T[];
  getSearchText: (item: T) => string; // concatenated searchable fields
  filters?: FilterDefinition<T>[]; // omit Phase for tools/pipelines
  sorts?: SortDefinition<T>[]; // typically nameSorts(getName)
  defaultPageSize?: number; // default 20
  pageSizeOptions?: number[]; // default [10, 20, 50]
  searchDebounceMs?: number; // default 250
};

export type UseSearchFilterReturn<T> = {
  // bar visibility (toggle owned by hook)
  isBarOpen: boolean;
  toggleBar: () => void;

  // search
  searchValue: string; // immediate (controls Input)
  onSearchChange: (value: string) => void;

  // filters + sort (ready-to-render descriptors)
  filterControls: FilterControl[];
  sortOptions: { key: string; label: string }[];
  selectedSortKey: string;
  onSortChange: (key: string) => void;

  // results
  visibleItems: T[]; // filtered + sorted + paginated
  totalCount: number; // after filter/search, before paging

  // pagination
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
};

/**
 * Default Name A-Z / Name Z-A sort definitions for a given name accessor.
 * Parents typically pass the result as the `sorts` param.
 */
export function nameSorts<T>(
  getName: (item: T) => string
): SortDefinition<T>[] {
  return [
    {
      key: 'name-asc',
      label: 'Name A-Z',
      compare: (a, b) => getName(a).localeCompare(getName(b)),
    },
    {
      key: 'name-desc',
      label: 'Name Z-A',
      compare: (a, b) => getName(b).localeCompare(getName(a)),
    },
  ];
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

/**
 * Headless search/filter/sort/pagination logic shared across the item
 * libraries (assistants, tools, pipelines). It owns all state and returns the
 * derived `visibleItems` plus ready-to-render descriptors for the bar and
 * pagination footer. Each parent renders its own card grid over `visibleItems`.
 */
export default function useSearchFilter<T>({
  items,
  getSearchText,
  filters = [],
  sorts = [],
  defaultPageSize = 12,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  searchDebounceMs = 250,
}: UseSearchFilterParams<T>): UseSearchFilterReturn<T> {
  const [isBarOpen, setIsBarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebounceValue(searchValue, searchDebounceMs);
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string>
  >({});
  const [selectedSortKey, setSelectedSortKey] = useState(sorts[0]?.key ?? '');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Derive filter dropdown options from the unique values present in the items.
  const filterControls = useMemo<FilterControl[]>(
    () =>
      filters.map((filter) => {
        const options = Array.from(
          new Set(
            items
              .map((item) => filter.getValue(item))
              .filter((value): value is string => Boolean(value))
          )
        ).sort((a, b) => a.localeCompare(b));

        return {
          key: filter.key,
          label: filter.label,
          allOptionLabel: filter.allOptionLabel,
          options,
          selectedValue: selectedFilters[filter.key] ?? '',
          onChange: (value: string) => {
            setSelectedFilters((previous) => ({
              ...previous,
              [filter.key]: value,
            }));
            setPage(1);
          },
        };
      }),
    [items, filters, selectedFilters]
  );

  // filter -> search -> sort (pagination is applied separately below).
  const filteredSortedItems = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    let result = items.filter((item) => {
      const matchesFilters = filters.every((filter) => {
        const selectedValue = selectedFilters[filter.key];
        if (!selectedValue) {
          return true; // '' = All
        }
        return filter.getValue(item) === selectedValue;
      });

      if (!matchesFilters) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return getSearchText(item).toLowerCase().includes(normalizedSearch);
    });

    const sortDefinition = sorts.find((sort) => sort.key === selectedSortKey);
    if (sortDefinition) {
      result = [...result].sort(sortDefinition.compare);
    }

    return result;
  }, [
    items,
    filters,
    selectedFilters,
    debouncedSearch,
    getSearchText,
    sorts,
    selectedSortKey,
  ]);

  const totalCount = filteredSortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Clamp page when the result set shrinks (e.g. filter/search reduces totalPages).
  const safePage = Math.min(page, totalPages);
  const visibleItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredSortedItems.slice(start, start + pageSize);
  }, [filteredSortedItems, safePage, pageSize]);

  return {
    isBarOpen,
    toggleBar: () => setIsBarOpen((previous) => !previous),

    searchValue,
    onSearchChange: (value: string) => {
      setSearchValue(value);
      setPage(1);
    },

    filterControls,
    sortOptions: sorts.map(({ key, label }) => ({ key, label })),
    selectedSortKey,
    onSortChange: (key: string) => {
      setSelectedSortKey(key);
      setPage(1);
    },

    visibleItems,
    totalCount,

    page: safePage,
    totalPages,
    onPageChange: setPage,
    pageSize,
    pageSizeOptions,
    onPageSizeChange: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
  };
}
