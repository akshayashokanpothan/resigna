import { cn } from '@/shared/utils/cn';

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton element. Shapes should match the content they stand in for.
 * Never use loading spinners — use Skeleton or Skeleton-based compositions.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-skeleton rounded-sm bg-layer-selected', className)}
      aria-hidden="true"
    />
  );
}

/** Skeleton text line */
export function SkeletonLine({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-3.5 w-full', className)} />;
}

/** Skeleton for a list row */
export function SkeletonRow({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center gap-3 py-3', className)}>
      <Skeleton className="size-8 shrink-0 rounded-control" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="w-2/5" />
        <SkeletonLine className="h-3 w-3/5" />
      </div>
    </div>
  );
}

/** Skeleton for a card */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-card border border-border bg-surface p-5', className)}>
      <SkeletonLine className="mb-3 w-1/3" />
      <SkeletonLine className="mb-2" />
      <SkeletonLine className="w-4/5" />
    </div>
  );
}
