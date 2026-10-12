'use client';

import {
  faBook,
  faCog,
  faExpand,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Tooltip, useOverlayState } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import AssistantsList from '@/app/(layoutWithSidebar)/components/Sidebar/AssistantsList/AssistantsList';
import logo from '@/app/(layoutWithSidebar)/components/Sidebar/logo/logo.svg';
import SignInButton from '@/app/(layoutWithSidebar)/components/Sidebar/SignInButton/SignInButton';
import UserDropdown from '@/app/(layoutWithSidebar)/components/Sidebar/UserDropdown/UserDropdown';
import useStore from '@/components/AssetsSidebar/hooks/useStore';
import ConfigureLifeCycle from '@/components/ConfigureLifeCycle/ConfigureLifeCycle';
import ThemeSwitcher from '@/components/ThemeSwitcher/ThemeSwitcher';
import ROUTES from '@/constants/routes';
import { db } from '@/db/db';
import useAuth from '@/lib/useAuth';

/**
 * The sidebar's contents, without the panel it sits in: the desktop column supplies
 * `box-white w-56`, the navigation drawer supplies its own panel. Keeping the two apart
 * lets a single instance move between them instead of being mounted twice.
 */
export default function SideBarContent() {
  const { setIsUiExpanded, resetStore } = useStore();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const configureAssistantsModalState = useOverlayState();

  const handleReset = () => {
    if (
      confirm(
        'Are you sure you want to reset all data? This includes all assets and settings.'
      )
    ) {
      db.delete();
      resetStore();

      window.location.href = window.location.origin;
    }
  };

  return (
    <>
      {/* `min-h-0` lets this shrink so the assistants list below scrolls instead of
          being clipped — it matters most in the drawer, where a short phone viewport
          is the only height constraint */}
      <div className="flex flex-col overflow-hidden min-h-0">
        <div className="flex justify-center">
          <div className="relative inline-block mt-3">
            <Link href={ROUTES.HOME}>
              {/* monochrome wordmark: invert so it stays legible on a dark surface */}
              <Image
                src={logo}
                alt="Logo of TIB AIssistant"
                width={200}
                className="dark:invert"
              />
            </Link>
          </div>
        </div>
        <hr className="mt-5" />

        <div className="py-2">
          <Link
            href={ROUTES.ASSISTANTS}
            className={`flex items-center gap-2 text-foreground ${
              pathname === ROUTES.ASSISTANTS ? 'font-semibold' : ''
            }`}
          >
            <FontAwesomeIcon icon={faBook} className="text-sm text-muted" />
            <span>Assistant library</span>
          </Link>
        </div>
        <hr />

        <div className="relative overflow-auto pb-4">
          {!isAuthenticated ? <SignInButton /> : <AssistantsList />}
        </div>
        {isAuthenticated && (
          <div className="pb-2">
            <Button
              size="sm"
              onPress={configureAssistantsModalState.toggle}
              variant="tertiary"
            >
              <FontAwesomeIcon icon={faCog} />
              Configure
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center relative">
        <div className="flex items-center gap-1">
          {isAuthenticated && (
            <>
              <UserDropdown />
              <Tooltip delay={0}>
                <Tooltip.Trigger>
                  <Button
                    size="sm"
                    isIconOnly
                    aria-label="Reset all data"
                    onPress={handleReset}
                    variant="tertiary"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content placement="top">
                  Reset all data
                </Tooltip.Content>
              </Tooltip>
            </>
          )}
          {/* below `lg` the container is full width already, so the toggle does nothing */}
          <Tooltip delay={0}>
            <Tooltip.Trigger>
              <Button
                size="sm"
                isIconOnly
                aria-label="Make full screen width"
                onPress={() => setIsUiExpanded((v) => !v)}
                variant="tertiary"
                className="hidden lg:inline-flex"
              >
                <FontAwesomeIcon icon={faExpand} />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content placement="top">
              Make full screen width
            </Tooltip.Content>
          </Tooltip>
          <ThemeSwitcher />
        </div>
      </div>

      {configureAssistantsModalState.isOpen && (
        <ConfigureLifeCycle
          onClose={configureAssistantsModalState.close}
          onOpenChange={configureAssistantsModalState.toggle}
        />
      )}
    </>
  );
}
