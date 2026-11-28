'use client';

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils/cn';
import { Kbd } from './Kbd';

type Side = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  /** Short, plain text. Never put interactive content in a tooltip. */
  content: React.ReactNode;
  /** Optional keyboard shortcut, rendered as <Kbd>. */
  shortcut?: string;
  side?: Side;
  /** One focusable element (button, link). */
  children: React.ReactElement<{ 'aria-describedby'?: string }>;
  /**
   * Link the tooltip to the trigger with aria-describedby. Turn off when the tooltip only
   * repeats the trigger's accessible name (icon buttons), so screen readers don't hear it twice.
   */
  describesTrigger?: boolean;
  /** Hide the tooltip completely (e.g. sidebar labels when the sidebar is expanded). */
  disabled?: boolean;
  /** Classes for the wrapper around the trigger, e.g. "flex w-full" for full-width rows. */
  triggerClassName?: string;
}

const OPEN_DELAY_MS = 400;

function isKeyboardFocus(target: EventTarget): boolean {
  try {
    return (target as HTMLElement).matches(':focus-visible');
  } catch {
    return true;
  }
}
const GAP_PX = 6;

/**
 * Tooltip — appears on hover (after a short delay) and on keyboard focus, and Escape dismisses
 * it (WCAG 1.4.13). Content must only repeat or supplement what is already on screen.
 * Rendered in a portal so it is never clipped by overflow-hidden containers.
 */
export function Tooltip({
  content,
  shortcut,
  side = 'top',
  children,
  describesTrigger = true,
  disabled = false,
  triggerClassName,
}: TooltipProps) {
  const id = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const clearTimer = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    openTimer.current = null;
  };

  const show = useCallback((delay: number) => {
    clearTimer();
    if (delay === 0) setOpen(true);
    else openTimer.current = setTimeout(() => setOpen(true), delay);
  }, []);

  const hide = useCallback(() => {
    clearTimer();
    setOpen(false);
    setPos(null);
  }, []);

  useEffect(() => clearTimer, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, hide]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !tipRef.current) return;
    const t = triggerRef.current.getBoundingClientRect();
    const tip = tipRef.current.getBoundingClientRect();
    const centerX = t.left + t.width / 2 - tip.width / 2;
    const centerY = t.top + t.height / 2 - tip.height / 2;
    const next = {
      top: { top: t.top - tip.height - GAP_PX, left: centerX },
      bottom: { top: t.bottom + GAP_PX, left: centerX },
      left: { top: centerY, left: t.left - tip.width - GAP_PX },
      right: { top: centerY, left: t.right + GAP_PX },
    }[side];
    const maxLeft = window.innerWidth - tip.width - 4;
    setPos({ top: Math.max(4, next.top), left: Math.min(Math.max(4, next.left), maxLeft) });
  }, [open, side]);

  if (disabled || !isValidElement(children)) return children;

  const trigger = describesTrigger
    ? cloneElement(children, { 'aria-describedby': open ? id : undefined })
    : children;

  return (
    <>
      <span
        ref={triggerRef}
        className={cn('inline-flex', triggerClassName)}
        onPointerEnter={() => show(OPEN_DELAY_MS)}
        onPointerLeave={hide}
        onFocus={(e) => {
          if (isKeyboardFocus(e.target)) show(0);
        }}
        onBlur={hide}
      >
        {trigger}
      </span>
      {open &&
        createPortal(
          <div
            ref={tipRef}
            id={id}
            role="tooltip"
            style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999 }}
            className={cn(
              'pointer-events-none fixed z-[70] flex max-w-xs items-center gap-2',
              'rounded-sm border border-border bg-surface-raised px-2 py-1 shadow-overlay',
              'type-caption text-fg',
              pos ? 'opacity-100' : 'opacity-0',
              'transition-opacity duration-fast ease-entrance',
            )}
          >
            <span>{content}</span>
            {shortcut && <Kbd>{shortcut}</Kbd>}
          </div>,
          document.body,
        )}
    </>
  );
}
