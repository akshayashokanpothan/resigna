import { SkeletonRow } from '@/shared/components/Skeleton';

interface ProjectListSkeletonProps {
  count?: number;
}

export function ProjectListSkeleton({ count = 5 }: ProjectListSkeletonProps) {
  return (
    <div
      className="divide-y divide-[hsl(var(--border))]"
      aria-label="Loading projects"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} className="px-4" />
      ))}
    </div>
  );
}
