import { cn } from '@/shared/utils/cn';
import { SkeletonRow } from './Skeleton';

interface LoadingStateProps {
  type?: 'list' | 'card' | 'page';
  count?: number;
  className?: string;
}

export function LoadingState({ type = 'list', count = 3, className }: LoadingStateProps) {
  if (type === 'list') {
    return (
      <div className={cn('divide-y divide-[hsl(var(--border))]', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  // More skeleton types can be added here
  return null;
}
