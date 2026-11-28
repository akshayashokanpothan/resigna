'use client';

import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { useCurrentUser, useSignOut } from '@/modules/auth';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/utils/cn';
import { Avatar } from '@/shared/components/Avatar';
import { Menu } from '@/shared/components/Menu';

export function UserMenu() {
  const { user } = useCurrentUser();
  const signOut = useSignOut();

  if (!user) return null;
  const displayName = user.name ?? user.email;

  return (
    <Menu
      label="User menu"
      header={
        <>
          <p className="truncate text-sm font-medium text-fg">{user.name ?? 'Account'}</p>
          <p className="truncate type-caption text-fg-secondary">{user.email}</p>
        </>
      }
      items={[
        { id: 'settings', label: 'Settings', icon: Settings, href: ROUTES.settings },
        {
          id: 'sign-out',
          label: signOut.isPending ? 'Signing out…' : 'Sign out',
          icon: LogOut,
          disabled: signOut.isPending,
          onSelect: () => signOut.mutate(),
        },
      ]}
      trigger={(props) => (
        <button
          {...props}
          type="button"
          aria-label="User menu"
          className={cn(
            'flex h-8 items-center gap-2 rounded-control pl-1 pr-2 text-sm focus-ring',
            'text-fg-secondary transition-colors duration-fast ease-standard hover:bg-layer-hover hover:text-fg',
            'aria-expanded:bg-layer-selected aria-expanded:text-fg',
          )}
        >
          <Avatar name={displayName} />
          <span className="hidden max-w-[140px] truncate text-xs sm:block">{displayName}</span>
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      )}
    />
  );
}
