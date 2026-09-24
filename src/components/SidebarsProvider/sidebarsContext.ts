import type { UseOverlayStateReturn } from '@heroui/react';
import { createContext } from 'react';

const NOOP_OVERLAY_STATE: UseOverlayStateReturn = {
  isOpen: false,
  setOpen: () => {},
  open: () => {},
  close: () => {},
  toggle: () => {},
};

const sidebarsContext = createContext<{
  navigationDrawerState: UseOverlayStateReturn;
  assetsDrawerState: UseOverlayStateReturn;
  /** True below the `lg` breakpoint, where both sidebars live in drawers. */
  isCompactViewport: boolean;
  /** Whether a page currently renders an assets panel, so the header can offer it. */
  hasAssetsPanel: boolean;
  setHasAssetsPanel: (hasAssetsPanel: boolean) => void;
}>({
  navigationDrawerState: NOOP_OVERLAY_STATE,
  assetsDrawerState: NOOP_OVERLAY_STATE,
  isCompactViewport: false,
  hasAssetsPanel: false,
  setHasAssetsPanel: () => {},
});

export default sidebarsContext;
