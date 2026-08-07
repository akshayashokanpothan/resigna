'use client';

import { useCurrentUser } from '@/modules/auth/hooks/use-session';
import { useSignOut } from '@/modules/auth/hooks/use-sign-out';
import { initials } from '@/shared/utils/format';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/utils/cn';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Settings, LogOut, ChevronDown } from 'lucide-react';

export function UserMenu() {
  const { user } = useCurrentUser();
  const signOut = useSignOut();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User menu"
        className={cn(
          'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
          'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[hsl(var(--primary))]',
        )}
      >
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-semibold"
          aria-hidden="true"
        >
          {initials(user.name ?? user.email)}
        </span>
        <span className="hidden sm:block max-w-[120px] truncate text-xs">
          {user.name ?? user.email}
        </span>
        <ChevronDown size={12} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="User menu"
          className={cn(
            'absolute right-0 top-full z-20 mt-1.5 w-52',
            'rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg',
            'p-1 overflow-hidden',
          )}
        >
          {/* User info */}
          <div className="px-3 py-2 border-b border-[hsl(var(--border))] mb-1">
            <p className="text-xs font-medium text-[hsl(var(--foreground))] truncate">
              {user.name ?? 'Account'}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
          </div>

          <Link
            href={ROUTES.settings}
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm',
              'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors',
            )}
          >
            <Settings size={14} aria-hidden="true" />
            Settings
          </Link>

          <button
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              signOut.mutate();
            }}
            disabled={signOut.isPending}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm',
              'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors',
              'disabled:opacity-50',
            )}
          >
            <LogOut size={14} aria-hidden="true" />
            {signOut.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}
