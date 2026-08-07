'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useCommandPaletteStore } from '@/stores/command-palette.store';
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcut';
import { useSignOut } from '@/modules/auth/hooks/use-sign-out';
import { variants, transition } from '@/shared/theme/motion';
import { cn } from '@/shared/utils/cn';
import { commandItems, commandGroups } from './command-palette.config';
import type { CommandItem } from './command-palette.config';

export function CommandPalette() {
  const { isOpen, query, close, setQuery } = useCommandPaletteStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const signOut = useSignOut();

  // Close on Escape
  useKeyboardShortcut({ key: 'Escape' }, () => {
    if (isOpen) close();
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = query
    ? commandItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : commandItems;

  const handleSelect = (item: CommandItem) => {
    close();
    if (item.href) {
      router.push(item.href);
    } else if (item.action === 'sign-out') {
      signOut.mutate();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition.fast}
            onClick={close}
            className="fixed inset-0 z-50 bg-black/60"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            {...variants.scaleIn}
            transition={transition.default}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className={cn(
              'fixed left-1/2 top-[20%] z-50 w-full max-w-[560px] -translate-x-1/2',
              'rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]',
              'shadow-2xl overflow-hidden',
            )}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] px-4">
              <Search size={16} className="shrink-0 text-[hsl(var(--muted-foreground))]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search…"
                className={cn(
                  'h-12 flex-1 bg-transparent text-sm text-[hsl(var(--foreground))]',
                  'placeholder:text-[hsl(var(--muted-foreground))] outline-none',
                )}
                aria-label="Search commands"
              />
              <button
                onClick={close}
                className="rounded p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                aria-label="Close command palette"
              >
                <X size={14} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[380px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
                  No results for &ldquo;{query}&rdquo;
                </p>
              ) : (
                commandGroups.map((group) => {
                  const items = filtered.filter((i) => i.group === group.id);
                  if (!items.length) return null;

                  return (
                    <div key={group.id} className="mb-1">
                      <p className="px-2 pb-1 pt-2 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                        {group.label}
                      </p>
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm',
                            'text-[hsl(var(--foreground))] transition-colors',
                            'hover:bg-[hsl(var(--muted))] focus-visible:bg-[hsl(var(--muted))]',
                            'outline-none focus-visible:outline-none',
                          )}
                        >
                          {item.icon && (
                            <item.icon size={15} className="text-[hsl(var(--muted-foreground))]" />
                          )}
                          <span>{item.label}</span>
                          {item.shortcut && (
                            <kbd className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">
                              {item.shortcut}
                            </kbd>
                          )}
                        </button>
                      ))}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[hsl(var(--border))] px-4 py-2.5 flex items-center gap-4">
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                <kbd className="font-mono">↑↓</kbd> navigate
              </span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                <kbd className="font-mono">↵</kbd> select
              </span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                <kbd className="font-mono">Esc</kbd> close
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
