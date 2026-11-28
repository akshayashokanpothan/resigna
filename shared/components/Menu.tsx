'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { transition, variants } from '@/shared/theme/motion';
import { cn } from '@/shared/utils/cn';

export interface MenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** Navigate on select. */
  href?: string;
  /** Run on select (ignored when href is set). */
  onSelect?: () => void;
  /** Styles the item as destructive. Pair with a confirmation for anything irreversible. */
  destructive?: boolean;
  disabled?: boolean;
  shortcut?: string;
}

interface TriggerProps {
  ref: React.Ref<HTMLButtonElement>;
  id: string;
  'aria-haspopup': 'menu';
  'aria-expanded': boolean;
  'aria-controls': string | undefined;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

interface MenuProps {
  /** Accessible name of the menu. */
  label: string;
  /** Render the trigger button and spread the props onto it. */
  trigger: (props: TriggerProps) => React.ReactNode;
  items: MenuItem[];
  /** Non-interactive content above the items (e.g. signed-in account). */
  header?: React.ReactNode;
  align?: 'start' | 'end';
  side?: 'top' | 'bottom';
  className?: string;
}

/**
 * Menu — WAI-ARIA menu button.
 * Keyboard: Enter, Space or ↓ opens and focuses the first item, ↑ opens on the last item,
 * ↑/↓ move, Home/End jump, Escape closes and returns focus to the trigger, Tab closes.
 */
export function Menu({
  label,
  trigger,
  items,
  header,
  align = 'end',
  side = 'bottom',
  className,
}: MenuProps) {
  const menuId = useId();
  const triggerId = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<'first' | 'last'>('first');

  const itemEls = () =>
    Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([aria-disabled="true"])',
      ) ?? [],
    );

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const openMenu = (focus: 'first' | 'last') => {
    pendingFocus.current = focus;
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const els = itemEls();
    (pendingFocus.current === 'first' ? els[0] : els[els.length - 1])?.focus();

    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, close]);

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMenu('first');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openMenu('last');
    }
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const els = itemEls();
    const index = els.indexOf(document.activeElement as HTMLElement);
    const move = (i: number) => els[(i + els.length) % els.length]?.focus();
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        move(index + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        move(index - 1);
        break;
      case 'Home':
        e.preventDefault();
        move(0);
        break;
      case 'End':
        e.preventDefault();
        move(els.length - 1);
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        close(true);
        break;
      case 'Tab':
        close(false);
        break;
    }
  };

  const itemClass = (item: MenuItem) =>
    cn(
      'flex w-full items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-left text-sm outline-none',
      'transition-colors duration-fast ease-standard',
      item.disabled
        ? 'cursor-not-allowed text-fg-muted'
        : item.destructive
          ? 'text-danger-text hover:bg-danger-subtle focus-visible:bg-danger-subtle'
          : 'text-fg hover:bg-layer-hover focus-visible:bg-layer-hover',
      'focus-visible:outline-none',
    );

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      {trigger({
        ref: triggerRef,
        id: triggerId,
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        'aria-controls': open ? menuId : undefined,
        onClick: () => (open ? close(false) : openMenu('first')),
        onKeyDown: onTriggerKeyDown,
      })}

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={label}
            onKeyDown={onMenuKeyDown}
            {...variants.fadeUp}
            transition={transition.fast}
            className={cn(
              'absolute z-30 min-w-52 overflow-hidden rounded-control border border-border bg-surface-raised p-1 shadow-overlay',
              align === 'end' ? 'right-0' : 'left-0',
              side === 'bottom' ? 'top-full mt-1.5' : 'bottom-full mb-1.5',
            )}
          >
            {header && <div className="mb-1 border-b border-border px-2.5 py-2">{header}</div>}
            {items.map((item) => {
              const content = (
                <>
                  {item.icon && <item.icon size={16} aria-hidden="true" className="shrink-0" />}
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.shortcut && (
                    <span className="font-mono text-2xs text-fg-secondary">{item.shortcut}</span>
                  )}
                </>
              );
              if (item.href && !item.disabled) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => close(false)}
                    className={itemClass(item)}
                  >
                    {content}
                  </Link>
                );
              }
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  aria-disabled={item.disabled || undefined}
                  onClick={() => {
                    if (item.disabled) return;
                    close(true);
                    item.onSelect?.();
                  }}
                  className={itemClass(item)}
                >
                  {content}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
