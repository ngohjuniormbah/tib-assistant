'use client';

import { faDesktop, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Key, Selection } from '@heroui/react';
import {
  Button,
  Popover,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  useIsHydrated,
} from '@heroui/react';
import { useTheme } from 'next-themes';
import { useState } from 'react';

const THEMES = [
  { id: 'system', label: 'Match system theme', icon: faDesktop },
  { id: 'light', label: 'Light theme', icon: faSun },
  { id: 'dark', label: 'Dark theme', icon: faMoon },
] as const;

export default function ThemeSwitcher() {
  const isHydrated = useIsHydrated();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // `theme` is read from localStorage, which the server cannot know. Rendering the
  // real selection before hydration would mismatch, so hold it back until then.
  const selectedKeys = new Set<Key>(isHydrated && theme ? [theme] : []);

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
      <Tooltip delay={0}>
        <Tooltip.Trigger>
          <Button
            size="sm"
            isIconOnly
            aria-label="Change theme"
            variant="tertiary"
          >
            <FontAwesomeIcon icon={faDesktop} />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content placement="top">Change theme</Tooltip.Content>
      </Tooltip>
      <Popover.Content placement="top">
        <Popover.Dialog className="p-1">
          <ToggleButtonGroup
            className="gap-1"
            size="sm"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={selectedKeys}
            onSelectionChange={(keys: Selection) => {
              const [selected] = keys as Set<Key>;
              if (selected) {
                setTheme(String(selected));
                setIsOpen(false);
              }
            }}
            aria-label="Colour theme"
          >
            {THEMES.map(({ id, label, icon }) => (
              <Tooltip key={id} delay={0}>
                <Tooltip.Trigger>
                  <ToggleButton id={id} isIconOnly aria-label={label}>
                    <FontAwesomeIcon icon={icon} />
                  </ToggleButton>
                </Tooltip.Trigger>
                <Tooltip.Content placement="top">{label}</Tooltip.Content>
              </Tooltip>
            ))}
          </ToggleButtonGroup>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
