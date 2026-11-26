'use client';

import Link from 'next/link';
import { useSignOut, useCurrentUser } from '@/modules/auth';
import { bottomNavItems } from '@/config/navigation';
import { SidebarNavItem } from './SidebarNavItem';
import { useSidebarStore } from '@/stores/sidebar.store';
import { initials } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import { LogOut } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';

export function SidebarFooter() {
  const { user } = useCurrentUser();
  const signOut = useSignOut();
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="flex flex-col gap-0.5 border-t border-[hsl(var(--border))] pt-2">
      <ul role="list" className="flex flex-col gap-0.5">
        {bottomNavItems.map((item) => (
          <li key={item.id}>
            <SidebarNavItem item={item} />
          </li>
        ))}
      </ul>

      {/* User profile row */}
      <div className="mt-1 flex items-center justify-between rounded-md px-2.5 py-2">
        <Link
          href={ROUTES.settings}
          className={cn(
            'flex min-w-0 items-center gap-2.5 text-sm',
            'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors',
          )}
          title={isCollapsed ? (user?.email ?? 'Account') : undefined}
        >
          {/* Avatar */}
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-semibold"
            aria-hidden="true"
          >
            {user ? initials(user.name ?? user.email) : '?'}
          </span>
          {!isCollapsed && (
            <span className="truncate text-xs">{user?.name ?? user?.email ?? 'Account'}</span>
          )}
        </Link>

        {!isCollapsed && (
          <button
            onClick={() => signOut.mutate()}
            disabled={signOut.isPending}
            aria-label="Sign out"
            title="Sign out"
            className={cn(
              'rounded p-1 text-[hsl(var(--muted-foreground))] transition-colors',
              'hover:text-[hsl(var(--foreground))] focus-visible:outline focus-visible:outline-2',
              'focus-visible:outline-offset-1 focus-visible:outline-[hsl(var(--primary))]',
              'disabled:opacity-50',
            )}
          >
            <LogOut size={14} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
