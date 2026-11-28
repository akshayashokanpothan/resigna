'use client';

import { useId, useRef } from 'react';
import { cn } from '@/shared/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  /** Optional count shown after the label, e.g. number of sources. */
  count?: number;
  disabled?: boolean;
}

interface TabsProps {
  /** Accessible name of the tab list. */
  label: string;
  items: TabItem[];
  value: string;
  onValueChange: (id: string) => void;
  /** Render the panel for the selected tab. */
  children: (selectedId: string) => React.ReactNode;
  className?: string;
}

/**
 * Tabs — WAI-ARIA tabs pattern with automatic activation.
 * Keyboard: ←/→ move between tabs, Home/End jump to the first/last, Tab moves into the panel.
 */
export function Tabs({ label, items, value, onValueChange, children, className }: TabsProps) {
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const enabled = items.filter((t) => !t.disabled);

  const focusTab = (id: string) => {
    onValueChange(id);
    listRef.current?.querySelector<HTMLButtonElement>(`[data-tab-id="${id}"]`)?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const index = enabled.findIndex((t) => t.id === value);
    let next: TabItem | undefined;
    if (e.key === 'ArrowRight') next = enabled[(index + 1) % enabled.length];
    else if (e.key === 'ArrowLeft') next = enabled[(index - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    if (next) {
      e.preventDefault();
      focusTab(next.id);
    }
  };

  return (
    <div className={className}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex gap-1 border-b border-border"
      >
        {items.map((tab) => {
          const selected = tab.id === value;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              data-tab-id={tab.id}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => onValueChange(tab.id)}
              className={cn(
                'relative -mb-px inline-flex h-9 items-center gap-2 rounded-t-sm border-b-2 px-3 text-sm',
                'transition-colors duration-fast ease-standard focus-ring-inset',
                selected
                  ? 'border-accent font-medium text-fg'
                  : 'border-transparent text-fg-secondary hover:border-border-strong hover:text-fg',
                'disabled:cursor-not-allowed disabled:border-transparent disabled:text-fg-muted',
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="rounded-pill bg-layer-selected px-1.5 font-mono text-2xs text-fg-secondary">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-${value}`}
        aria-labelledby={`${baseId}-tab-${value}`}
        tabIndex={0}
        className="pt-4 focus-visible:outline-none"
      >
        {children(value)}
      </div>
    </div>
  );
}
