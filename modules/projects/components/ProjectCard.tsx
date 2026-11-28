import Link from 'next/link';
import { formatRelativeDate } from '@/shared/utils/format';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/utils/cn';
import { Badge } from '@/shared/components/Badge';
import type { Project } from '../types/project.types';

interface ProjectCardProps {
  project: Project;
  /** Called on hover, focus or touch, so the page's data can load before the click. */
  onIntent?: (project: Project) => void;
}

export function ProjectCard({ project, onIntent }: ProjectCardProps) {
  const intent = onIntent ? () => onIntent(project) : undefined;
  return (
    <Link
      href={ROUTES.project(project.id)}
      onPointerEnter={intent}
      onFocus={intent}
      className={cn(
        'flex items-center gap-4 px-4 py-3 transition-colors duration-fast ease-standard',
        'hover:bg-layer-hover focus-ring-inset',
        'border-b border-border last:border-b-0',
      )}
    >
      {/* Project icon */}
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-control border border-border bg-surface-raised text-fg-secondary"
        aria-hidden="true"
      >
        <span className="font-mono text-xs font-medium uppercase">{project.name.slice(0, 2)}</span>
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2 truncate text-sm font-medium text-fg">
          <span className="truncate">{project.name}</span>
          {project.status === 'archived' && <Badge>Archived</Badge>}
        </span>
        {project.description && (
          <span className="truncate type-body-sm text-fg-secondary">{project.description}</span>
        )}
      </div>

      {/* Meta */}
      <span className="shrink-0 type-caption text-fg-secondary">
        {formatRelativeDate(project.updatedAt)}
      </span>
    </Link>
  );
}
