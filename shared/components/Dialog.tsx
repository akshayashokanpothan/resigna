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
  /** max width: sm 400 px, md 480 px, lg 640 px */
  size?: 'sm' | 'md' | 'lg';
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal dialog. Closes on Escape and backdrop click, keeps Tab focus inside the panel,
 * and returns focus to the element that opened it.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
}: DialogProps) {
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
            className="fixed inset-0 z-50 bg-overlay"
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
                'pointer-events-auto w-full rounded-dialog border border-border',
                'bg-surface p-6 shadow-overlay outline-none',
                { sm: 'max-w-[400px]', md: 'max-w-[480px]', lg: 'max-w-[640px]' }[size],
                className,
              )}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 id={titleId} className="type-heading-sm text-fg">
                    {title}
                  </h2>
                  {description && (
                    <p id={descriptionId} className="mt-1 type-body text-fg-secondary">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className={cn(
                    '-mr-1.5 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-control',
                    'text-fg-secondary transition-colors duration-fast hover:bg-layer-hover hover:text-fg',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus',
                  )}
                >
                  <X size={16} aria-hidden="true" />
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
