'use client';

import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { transition, variants } from '@/shared/theme/motion';
import { cn } from '@/shared/utils/cn';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal dialog. Closes on Escape and backdrop click, keeps Tab focus inside the panel,
 * and returns focus to the element that opened it.
 */
export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (!firstEl || !lastEl) return;
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="dialog-backdrop"
            {...variants.fadeIn}
            transition={transition.fast}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60"
            aria-hidden="true"
          />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]">
            <motion.div
              key="dialog-panel"
              ref={panelRef}
              {...variants.scaleIn}
              transition={transition.default}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={description ? descriptionId : undefined}
              tabIndex={-1}
              className={cn(
                'pointer-events-auto w-full max-w-md rounded-xl border border-[hsl(var(--border))]',
                'bg-[hsl(var(--card))] p-5 shadow-2xl outline-none',
                className,
              )}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 id={titleId} className="text-sm font-semibold text-[hsl(var(--foreground))]">
                    {title}
                  </h2>
                  {description && (
                    <p
                      id={descriptionId}
                      className="mt-1 text-sm text-[hsl(var(--muted-foreground))]"
                    >
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className={cn(
                    'rounded p-1 text-[hsl(var(--muted-foreground))] transition-colors',
                    'hover:text-[hsl(var(--foreground))]',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[hsl(var(--primary))]',
                  )}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
