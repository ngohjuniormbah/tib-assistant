/**
 * Builds a windowed list of pagination items for a page range. Always includes
 * the first and last page plus the pages immediately around the current one
 * (current ± 1); any gap between shown pages collapses into a single 'ellipsis'
 * marker. Returns e.g. [1, 'ellipsis', 4, 5, 6, 'ellipsis', 30].
 */
export function getPaginationItems(
  currentPage: number,
  lastPage: number
): (number | 'ellipsis')[] {
  if (lastPage <= 1) {
    return lastPage < 1 ? [] : [1];
  }

  const shownPages = new Set<number>([1, lastPage]);
  for (let page = currentPage - 1; page <= currentPage + 1; page++) {
    if (page >= 1 && page <= lastPage) {
      shownPages.add(page);
    }
  }

  const sortedPages = Array.from(shownPages).sort(
    (first, second) => first - second
  );

  const items: (number | 'ellipsis')[] = [];
  let previousPage = 0;
  for (const page of sortedPages) {
    if (page - previousPage > 1) {
      items.push('ellipsis');
    }
    items.push(page);
    previousPage = page;
  }

  return items;
}
