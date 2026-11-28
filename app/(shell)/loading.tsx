import { LoadingState } from '@/shared/components/LoadingState';
import { Skeleton } from '@/shared/components/Skeleton';

/**
 * Shown immediately when a sidebar or project link is clicked, while the next page loads,
 * so a click always gets instant feedback instead of the old page sitting still.
 */
export default function ShellLoading() {
  return (
    <div className="mx-auto max-w-5xl px-8 py-8" aria-busy="true">
      <Skeleton className="mb-3 h-7 w-40" />
      <Skeleton className="mb-8 h-4 w-80" />
      <div className="overflow-hidden rounded-card border border-border bg-surface">
        <LoadingState type="list" count={4} label="Loading page" />
      </div>
    </div>
  );
}
