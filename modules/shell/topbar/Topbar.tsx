'use client';

import { Bell, Search } from 'lucide-react';
import { useCommandPaletteStore } from '@/stores/command-palette.store';
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcut';
import { Breadcrumbs } from './Breadcrumbs';
import { UserMenu } from './UserMenu';
import { cn } from '@/shared/utils/cn';

export function Topbar() {
  const { open } = useCommandPaletteStore();

  useKeyboardShortcut({ key: 'k', meta: true }, open);

  return (
    <header
      className={cn(
        'flex h-12 shrink-0 items-center justify-between',
        'border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]',
        'px-4',
      )}
    >
      {/* Left — breadcrumbs */}
      <div className="flex min-w-0 items-center">
        <Breadcrumbs />
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1">
        {/* Search / Command Palette trigger */}
        <button
          onClick={open}
          aria-label="Open command palette (⌘K)"
          className={cn(
            'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs',
            'text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]',
            'hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1',
            'focus-visible:outline-[hsl(var(--primary))]',
          )}
        >
          <Search size={13} aria-hidden="true" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline ml-1 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">
            ⌘K
          </kbd>
        </button>

        {/* Notifications placeholder */}
        <button
          aria-label="Notifications (coming soon)"
          title="Notifications — coming soon"
          disabled
          className={cn(
            'rounded-md p-2 text-[hsl(var(--muted-foreground))]',
            'disabled:cursor-not-allowed disabled:opacity-40',
          )}
        >
          <Bell size={16} aria-hidden="true" />
        </button>

        {/* User menu */}
        <UserMenu />
      </div>
    </header>
  );
}
