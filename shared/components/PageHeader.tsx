import { cn } from '@/shared/utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Small label above the title, e.g. the section ("Research"). */
  eyebrow?: string;
  /** Status badges next to the title. */
  meta?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  meta,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 type-overline text-fg-secondary">{eyebrow}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="type-heading-md text-fg">{title}</h1>
          {meta}
        </div>
        {description && <p className="mt-1 max-w-2xl type-body text-fg-secondary">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
