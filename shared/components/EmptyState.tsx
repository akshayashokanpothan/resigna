import { cn } from '@/shared/utils/cn';
import type { LucideIcon } from 'lucide-react';
import { Illustration, type IllustrationName } from './Illustration';

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Brand illustration for page-level empty states. */
  illustration?: IllustrationName;
  /** Small icon for compact, in-panel empty states. Ignored when illustration is set. */
  icon?: LucideIcon;
  /** Primary next step, usually a <Button>. */
  action?: React.ReactNode;
  /** Secondary help, e.g. a link to docs. */
  secondaryAction?: React.ReactNode;
  size?: 'compact' | 'page';
  className?: string;
}

/**
 * Empty state — answers "what is this, why is it empty, what can I do next".
 * Use an illustration for page-level states and an icon inside panels and lists.
 */
export function EmptyState({
  title,
  description,
  illustration,
  icon: Icon,
  action,
  secondaryAction,
  size = 'page',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        size === 'page' ? 'gap-4 px-8 py-14' : 'gap-3 px-6 py-10',
        className,
      )}
    >
      {illustration ? (
        <Illustration name={illustration} width={size === 'page' ? 200 : 144} />
      ) : (
        Icon && (
          <div className="flex size-10 items-center justify-center rounded-control border border-border bg-surface-raised">
            <Icon size={18} className="text-fg-secondary" aria-hidden="true" />
          </div>
        )
      )}
      <div className="max-w-sm">
        <h2
          className={cn('text-fg', size === 'page' ? 'type-heading-sm' : 'text-sm font-semibold')}
        >
          {title}
        </h2>
        {description && <p className="mt-1 type-body text-fg-secondary">{description}</p>}
      </div>
      {(action || secondaryAction) && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
