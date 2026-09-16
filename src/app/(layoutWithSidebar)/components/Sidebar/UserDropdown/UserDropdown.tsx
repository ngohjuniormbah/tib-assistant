import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Description, Dropdown, Label, Tooltip } from '@heroui/react';
import { env } from 'next-runtime-env';
import { useTransition } from 'react';
import useSWR, { useSWRConfig } from 'swr';

import useStore from '@/components/AssetsSidebar/hooks/useStore';
import { db } from '@/db/db';
import useTokens from '@/lib/useTokens';
import useUserConsent from '@/lib/useUserConsent';
import { getUserData, signOut } from '@/pocketbase/auth';
import { UserConsentNameOptions } from '@/types/pocketbase-types';

const formatNumber = (num?: number | string) => {
  return Number(num).toLocaleString(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
};

export default function UserDropdown() {
  const [isLoading, startTransition] = useTransition();
  const { mutate } = useSWRConfig();
  const { resetStore } = useStore();
  const { data: user } = useSWR('getUserData', getUserData);
  const { usedTokens, resetInHours } = useTokens();
  const { isConsentGiven } = useUserConsent();

  const handleSignOutClick = async () => {
    if (
      confirm(
        'Are you sure you want to signout and reset all data? This includes all assets and settings.'
      )
    ) {
      db.assets.clear();
      resetStore();
      startTransition(async () => {
        const response = await signOut(window.location.origin);
        mutate('getUserData', null);
        mutate('checkIfAuthenticated', false);
        window.location.href = response.url;
      });
    }
  };

  const handleAccountSettingsClick = () => {
    const url = `${env('NEXT_PUBLIC_KEYCLOAK_URL')}/realms/orkg/account?referrer=orkg-ask&referrer_uri=${window.location.href}`;
    window.location.href = url;
  };
  if (!user) {
    return null;
  }
  const isGravatarConsentGiven = isConsentGiven(
    UserConsentNameOptions.gravatar
  );

  return (
    <Dropdown>
      <Tooltip delay={0}>
        <Dropdown.Trigger
          isDisabled={isLoading}
          className="transition-transform"
        >
          <Avatar size="sm">
            <Avatar.Image
              src={
                isGravatarConsentGiven
                  ? `https://gravatar.com/avatar/${user.emailHashed}?d=retro&r=g&s=100`
                  : undefined
              }
              alt="User avatar"
            />
            <Avatar.Fallback>
              <FontAwesomeIcon icon={faUser} className="text-foreground" />
            </Avatar.Fallback>
          </Avatar>
        </Dropdown.Trigger>
        <Tooltip.Content placement="top">Account settings</Tooltip.Content>
      </Tooltip>
      <Dropdown.Popover placement="bottom start">
        <Dropdown.Menu
          aria-label="Profile Actions"
          disabledKeys={['usedTokens']}
        >
          <Dropdown.Item id="usedTokens" textValue="Used tokens today">
            <div className="flex flex-col">
              <Label>
                Used tokens today: {formatNumber(usedTokens || 0)}/
                {formatNumber(env('NEXT_PUBLIC_TOKEN_DAILY_LIMIT'))}
              </Label>
              <Description>Resets in {resetInHours} hours</Description>
            </div>
          </Dropdown.Item>
          <Dropdown.Item
            id="settings"
            textValue="Account settings"
            onAction={handleAccountSettingsClick}
          >
            <Label>Account settings</Label>
          </Dropdown.Item>
          <Dropdown.Item
            id="logout"
            textValue="Log Out"
            variant="danger"
            onAction={handleSignOutClick}
          >
            <Label>Log Out</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
