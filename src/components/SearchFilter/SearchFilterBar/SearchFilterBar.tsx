'use client';

import { Label, ListBox, SearchField, Select } from '@heroui/react';

import { FilterControl } from '@/components/SearchFilter/useSearchFilter';

// Sentinel key for the "All" option: react-aria Select does not handle an
// empty-string key well, so we map '' <-> ALL_KEY at the UI boundary.
const ALL_KEY = '__all__';

type SearchFilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterControls: FilterControl[];
  sortOptions: { key: string; label: string }[];
  selectedSortKey: string;
  onSortChange: (key: string) => void;
};

export default function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterControls,
  sortOptions,
  selectedSortKey,
  onSortChange,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      {/* below `sm` every control takes its own full-width line; above it they sit
          side by side at their natural widths and wrap as needed */}
      <SearchField
        className="w-full sm:w-auto sm:flex-1 sm:min-w-[200px]"
        value={searchValue}
        onChange={onSearchChange}
      >
        <Label>Search</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={searchPlaceholder} />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      {filterControls.map((filterControl) => (
        <Select
          key={filterControl.key}
          className="w-full sm:w-[180px]"
          selectedKey={filterControl.selectedValue || ALL_KEY}
          onSelectionChange={(key) =>
            filterControl.onChange(key === ALL_KEY ? '' : String(key))
          }
        >
          <Label>{filterControl.label}</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item
                id={ALL_KEY}
                textValue={filterControl.allOptionLabel}
              >
                {filterControl.allOptionLabel}
              </ListBox.Item>
              {filterControl.options.map((option) => (
                <ListBox.Item key={option} id={option} textValue={option}>
                  {option}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      ))}

      {sortOptions.length > 0 && (
        <Select
          className="w-full sm:w-[160px]"
          selectedKey={selectedSortKey}
          onSelectionChange={(key) => onSortChange(String(key))}
        >
          <Label>Sort</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {sortOptions.map((sortOption) => (
                <ListBox.Item
                  key={sortOption.key}
                  id={sortOption.key}
                  textValue={sortOption.label}
                >
                  {sortOption.label}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      )}
    </div>
  );
}
