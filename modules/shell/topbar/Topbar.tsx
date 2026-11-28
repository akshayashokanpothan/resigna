'use client';

import { Bell, Search } from 'lucide-react';
import { useCommandPaletteStore } from '@/stores/command-palette.store';
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcut';
import { IconButton } from '@/shared/components/IconButton';
import { Kbd } from '@/shared/components/Kbd';
import { cn } from '@/shared/utils/cn';
import { Breadcrumbs } from './Breadcrumbs';
import { UserMenu } from './UserMenu';

export function Topbar() {
  const { open } = useCommandPaletteStore();

  useKeyboardShortcut({ key: 'k', meta: true }, open);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-border bg-canvas px-4">
      {/* Left — breadcrumbs */}
      <div className="flex min-w-0 items-center">
        <Breadcrumbs />
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={open}
          aria-label="Search and commands"
          aria-keyshortcuts="Meta+K"
          className={cn(
            'flex h-8 w-56 items-center gap-2 rounded-control border border-border bg-surface px-2.5 text-sm focus-ring',
            'text-fg-secondary transition-colors duration-fast ease-standard',
            'hover:border-border-strong hover:text-fg max-sm:w-auto',
          )}
        >
          <Search size={14} aria-hidden="true" />
          <span className="flex-1 text-left max-sm:hidden">Search</span>
          <Kbd className="max-sm:hidden">⌘K</Kbd>
        </button>

        <IconButton icon={Bell} label="Notifications — coming soon" disabled />

        <UserMenu />
      </div>
    </header>
  );
}
