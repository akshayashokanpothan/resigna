import { cn } from '@/shared/utils/cn';

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton element.
 * Never use loading spinners — use Skeleton or Skeleton-based compositions.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[hsl(var(--muted))]', className)}
      aria-hidden="true"
    />
  );
}

/** Skeleton text line */
export function SkeletonLine({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} />;
}

/** Skeleton for a list row */
export function SkeletonRow({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center gap-3 py-3', className)}>
      <Skeleton className="h-8 w-8 rounded-md shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="w-2/5" />
        <SkeletonLine className="w-3/5" />
      </div>
    </div>
  );
}
