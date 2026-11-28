import { LoadingState } from '@/shared/components/LoadingState';

/**
 * Shown immediately when a sidebar or project link is clicked, while the next page loads,
 * so a click always gets instant feedback instead of the old page sitting still.
 */
export default function ShellLoading() {
  return (
    <div className="mx-auto max-w-3xl p-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="rounded-lg border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--card))]">
        <LoadingState type="list" count={4} />
      </div>
    </div>
  );
}
