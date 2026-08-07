import { cn } from '@/shared/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Empty state — professional, text-focused, no illustrations or mascots.
 * Use for zero-data states across all surfaces.
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 px-8 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
          <Icon size={18} className="text-[hsl(var(--muted-foreground))]" aria-hidden="true" />
        </div>
      )}
      <div className="max-w-xs">
        <h3 className="text-sm font-medium text-[hsl(var(--foreground))]">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
