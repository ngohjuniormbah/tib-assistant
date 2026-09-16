'use client';

import { useMediaQuery } from 'usehooks-ts';

/** Tailwind's `lg` breakpoint. Below it the sidebars become drawers. */
const COMPACT_VIEWPORT_QUERY = '(width < 64rem)';

export default function useIsCompactViewport() {
  // `initializeWithValue: false` keeps the server render and the hydration render in
  // agreement. usehooks-ts corrects the value in a layout effect, so the browser never
  // paints the wrong breakpoint.
  return useMediaQuery(COMPACT_VIEWPORT_QUERY, { initializeWithValue: false });
}
