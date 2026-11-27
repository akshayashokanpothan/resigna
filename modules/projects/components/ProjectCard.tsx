import Link from 'next/link';
import { formatRelativeDate } from '@/shared/utils/format';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/utils/cn';
import type { Project } from '../types/project.types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={ROUTES.project(project.id)}
      className={cn(
        'flex items-center gap-4 px-4 py-3 transition-colors',
        'hover:bg-[hsl(var(--muted))]',
        'focus-visible:bg-[hsl(var(--muted))] focus-visible:outline-none',
        'border-b border-[hsl(var(--border))] last:border-b-0',
      )}
    >
      {/* Project icon */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
        aria-hidden="true"
      >
        <span className="text-xs font-semibold uppercase">{project.name.slice(0, 2)}</span>
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2 truncate text-sm font-medium text-[hsl(var(--foreground))]">
          <span className="truncate">{project.name}</span>
          {project.status === 'archived' && (
            <span className="shrink-0 rounded border border-[hsl(var(--border))] px-1.5 text-xs font-normal text-[hsl(var(--muted-foreground))]">
              Archived
            </span>
          )}
        </span>
        {project.description && (
          <span className="truncate text-xs text-[hsl(var(--muted-foreground))]">
            {project.description}
          </span>
        )}
      </div>

      {/* Meta */}
      <span className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
        {formatRelativeDate(project.updatedAt)}
      </span>
    </Link>
  );
}
