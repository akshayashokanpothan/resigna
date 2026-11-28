import { IS_BETA } from '@/shared/constants/release';
import { cn } from '@/shared/utils/cn';

/**
 * "Beta" pill shown next to the logo on BA builds. Renders nothing on GA.
 * Amber (warning) so it can't be mistaken for the indigo accent; the word carries the meaning.
 */
export function BetaBadge({ className }: { className?: string }) {
  if (!IS_BETA) return null;
  return (
    <span
      title="Beta Access (preview). Not the production version."
      className={cn(
        'inline-flex h-[18px] shrink-0 items-center rounded-pill border border-warning/40 bg-warning-subtle px-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-warning-text',
        className,
      )}
    >
      Beta
    </span>
  );
}

/** Thin amber strip along the top of every page on BA builds, visible even where no logo is. */
export function BetaStrip() {
  return (
    <div
      role="note"
      aria-label="Resigna Beta: preview build, not production"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] bg-warning"
    />
  );
}
