import { cn } from '@/shared/utils/cn';
import { SkeletonCard, SkeletonRow } from './Skeleton';

interface LoadingStateProps {
  type?: 'list' | 'card';
  count?: number;
  /** Announced to screen readers while loading. */
  label?: string;
  className?: string;
}

export function LoadingState({
  type = 'list',
  count = 3,
  label = 'Loading',
  className,
}: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {type === 'list' ? (
        <div className="divide-y divide-border">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonRow key={i} className="px-4" />
          ))}
        </div>
      ) : (
        <div className={cn('grid gap-4 sm:grid-cols-2')}>
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
