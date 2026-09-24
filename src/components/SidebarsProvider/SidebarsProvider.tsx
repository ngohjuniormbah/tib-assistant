'use client';

import { useOverlayState } from '@heroui/react';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

import sidebarsContext from '@/components/SidebarsProvider/sidebarsContext';
import useIsCompactViewport from '@/hooks/useIsCompactViewport/useIsCompactViewport';

export default function SidebarsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const navigationDrawerState = useOverlayState();
  const assetsDrawerState = useOverlayState();
  const isCompactViewport = useIsCompactViewport();
  const [hasAssetsPanel, setHasAssetsPanel] = useState(false);
  const pathname = usePathname();

  // following a link inside the navigation drawer must not leave it hanging open
  useEffect(() => {
    navigationDrawerState.close();
    assetsDrawerState.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // growing past the breakpoint restores the inline sidebars, so nothing is left
  // behind an invisible backdrop
  useEffect(() => {
    if (!isCompactViewport) {
      navigationDrawerState.close();
      assetsDrawerState.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompactViewport]);

  return (
    <sidebarsContext.Provider
      value={{
        navigationDrawerState,
        assetsDrawerState,
        isCompactViewport,
        hasAssetsPanel,
        setHasAssetsPanel,
      }}
    >
      {children}
    </sidebarsContext.Provider>
  );
}
