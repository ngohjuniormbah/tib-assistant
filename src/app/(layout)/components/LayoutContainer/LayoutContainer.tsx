'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useContext, useEffect } from 'react';

import AppHeader from '@/app/(layout)/components/AppHeader/AppHeader';
import useStore from '@/components/AssetsSidebar/hooks/useStore';
import ConsentModal from '@/components/ConsentModal/ConsentModal';
import sidebarsContext from '@/components/SidebarsProvider/sidebarsContext';
import ROUTES from '@/constants/routes';
import useVersionCheck from '@/hooks/useVersionCheck/useVersionCheck';

export default function LayoutContainer({ children }: { children: ReactNode }) {
  const { isUiExpanded, resetStore } = useStore();
  useVersionCheck(resetStore);
  const pathname = usePathname();
  const isAssistant = pathname.startsWith('/assistants/');
  const { isCompactViewport } = useContext(sidebarsContext);

  useEffect(() => {
    document.title = 'TIB AIssistant';
  }, []);

  // The assistant view is locked to the viewport so the composer stays reachable.
  // On a phone that leaves no room for a footer too, so it moves below the locked
  // box: overscrolling past the end of the conversation chains to the page and
  // brings it into view. Rendered in one place or the other, never both.
  const shouldFooterScrollIntoView = isAssistant && isCompactViewport;

  const widthClassName = !isUiExpanded
    ? 'container lg:px-4'
    : 'max-w-full lg:px-5';

  const footer = (
    <footer
      className={
        isAssistant && !shouldFooterScrollIntoView ? 'pt-0 pb-2' : 'pt-5 pb-4'
      }
    >
      <ul className="flex flex-wrap justify-center">
        <ListItem>
          <Link href={ROUTES.ABOUT}>About</Link>
        </ListItem>
        <ListItem>
          <Link
            href="https://gitlab.com/TIBHannover/orkg/tib-aissistant/web-app"
            target="_blank"
          >
            Source code
          </Link>
        </ListItem>
        <ListItem>
          <ConsentModal />
        </ListItem>
        <ListItem>
          <Link href={ROUTES.TERMS_OF_USE}>Terms of use</Link>
        </ListItem>
        <ListItem>
          <Link href={ROUTES.DATA_PROTECTION}>Data protection</Link>
        </ListItem>
        <ListItem>
          <Link href={ROUTES.IMPRINT}>Imprint</Link>
        </ListItem>
        <ListItem>
          <Link href={ROUTES.ACCESSIBILITY}>Accessibility statement</Link>
        </ListItem>
        <ListItem>
          <Link
            href="https://gitlab.com/TIBHannover/orkg/tib-aissistant/web-app/-/blob/main/CHANGELOG.md"
            target="_blank"
          >
            Changelog v{process.env.version}
          </Link>
        </ListItem>
      </ul>
    </footer>
  );

  return (
    <div className="min-h-screen w-full h-full bg-gradient-to-bl from-canvas-start to-canvas-end bg-fixed">
      {/* Tailwind v4's `container` is width-only, so small screens need their own gutter.
          `dvh` rather than `vh` so the chat still fits under mobile browser chrome. */}
      <div
        className={`${widthClassName} ${
          isAssistant ? 'h-dvh' : ''
        } px-1 mx-auto transition-max-width duration-300 flex flex-col`}
      >
        <AppHeader />
        <div
          // `overflow-hidden`, not `overflow-y-hidden`: hiding one axis computes the
          // other to `auto`, which can leave a stray horizontal scrollbar
          className={`flex gap-4 ${isAssistant ? 'h-full min-h-0' : ''} lg:pt-10 pb-2 overflow-hidden`}
        >
          {children}
        </div>
        {!shouldFooterScrollIntoView && footer}
      </div>
      {shouldFooterScrollIntoView && (
        <div className={`${widthClassName} mx-auto`}>{footer}</div>
      )}
    </div>
  );
}

function ListItem({ children }: { children: ReactNode }) {
  return (
    <li className="after:content-['•'] after:inline-block after:px-2 last:after:px-0 last:after:content-[''] text-muted [&_a]:text-muted inline">
      {children}
    </li>
  );
}
