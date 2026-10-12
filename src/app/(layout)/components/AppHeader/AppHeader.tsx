'use client';

import { faBars, faDatabase } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useContext } from 'react';

import logo from '@/app/(layoutWithSidebar)/components/Sidebar/logo/logo.svg';
import NavigationDrawer from '@/app/(layoutWithSidebar)/components/Sidebar/NavigationDrawer/NavigationDrawer';
import sidebarsContext from '@/components/SidebarsProvider/sidebarsContext';
import ROUTES from '@/constants/routes';

/**
 * Below `lg` the sidebars collapse into drawers, leaving the logo and both toggles
 * without a home. At `lg` and up the inline sidebars carry them and this renders nothing.
 */
export default function AppHeader() {
  const {
    navigationDrawerState,
    assetsDrawerState,
    isCompactViewport,
    hasAssetsPanel,
  } = useContext(sidebarsContext);

  if (!isCompactViewport) {
    return null;
  }

  return (
    <>
      <header className="box-white mt-1 mb-2 flex items-center justify-between gap-2 !py-2 !px-3">
        <Button
          size="sm"
          isIconOnly
          aria-label="Open navigation menu"
          onPress={navigationDrawerState.open}
          variant="tertiary"
        >
          <FontAwesomeIcon icon={faBars} />
        </Button>

        <Link href={ROUTES.HOME}>
          {/* monochrome wordmark: invert so it stays legible on a dark surface */}
          <Image
            src={logo}
            alt="Logo of TIB AIssistant"
            width={140}
            className="dark:invert"
          />
        </Link>

        {hasAssetsPanel ? (
          <Button
            size="sm"
            isIconOnly
            aria-label="Open assets"
            onPress={assetsDrawerState.open}
            variant="tertiary"
          >
            <FontAwesomeIcon icon={faDatabase} />
          </Button>
        ) : (
          // placeholder so the wordmark stays centred when there are no assets
          <span className="w-8" aria-hidden />
        )}
      </header>

      <NavigationDrawer
        isOpen={navigationDrawerState.isOpen}
        onOpenChange={navigationDrawerState.setOpen}
      />
    </>
  );
}
