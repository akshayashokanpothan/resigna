'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useCommandPaletteStore } from '@/stores/command-palette.store';
import { useProjectDialogStore } from '@/stores/project-dialog.store';
import { ROUTES } from '@/shared/constants/routes';
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcut';
import { useSignOut } from '@/modules/auth';
import { variants, transition } from '@/shared/theme/motion';
import { cn } from '@/shared/utils/cn';
import { Kbd } from '@/shared/components/Kbd';
import { commandItems, commandGroups } from './command-palette.config';
import type { CommandItem } from './command-palette.config';

export function CommandPalette() {
  const { isOpen, query, close, setQuery } = useCommandPaletteStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const signOut = useSignOut();
  const openCreateProject = useProjectDialogStore((state) => state.openCreate);

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
    } else if (item.action === 'new-project') {
      router.push(ROUTES.projects);
      openCreateProject();
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
            className="fixed inset-0 z-50 bg-overlay"
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
              'rounded-dialog border border-border bg-surface',
              'shadow-overlay overflow-hidden',
            )}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search size={16} className="shrink-0 text-fg-secondary" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search…"
                className={cn(
                  'h-12 flex-1 bg-transparent text-sm text-fg',
                  'placeholder:text-fg-muted outline-none',
                )}
                aria-label="Search commands"
              />
              <button
                onClick={close}
                className="inline-flex size-7 items-center justify-center rounded-control text-fg-secondary transition-colors duration-fast hover:bg-layer-hover hover:text-fg focus-ring"
                aria-label="Close command palette"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[380px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-fg-secondary">
                  No results for &ldquo;{query}&rdquo;
                </p>
              ) : (
                commandGroups.map((group) => {
                  const items = filtered.filter((i) => i.group === group.id);
                  if (!items.length) return null;

                  return (
                    <div key={group.id} className="mb-1">
                      <p className="px-3 pb-1 pt-2 type-overline text-fg-secondary">
                        {group.label}
                      </p>
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-control px-3 py-2 text-sm',
                            'text-fg transition-colors',
                            'hover:bg-layer-hover focus-visible:bg-layer-selected focus-ring-inset',
                          )}
                        >
                          {item.icon && <item.icon size={15} className="text-fg-secondary" />}
                          <span>{item.label}</span>
                          {item.shortcut && (
                            <kbd className="ml-auto text-xs text-fg-secondary">{item.shortcut}</kbd>
                          )}
                        </button>
                      ))}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2.5 flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-fg-secondary">
                <Kbd>↑↓</Kbd> navigate
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-fg-secondary">
                <Kbd>↵</Kbd> select
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-fg-secondary">
                <Kbd>Esc</Kbd> close
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
