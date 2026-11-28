import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

/**
 * Badge — a short, read-only status label.
 * Never rely on colour alone: the text must carry the meaning ("Validated", not just green).
 */
const badgeVariants = cva(
  'inline-flex h-5 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill border px-2 type-label',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-layer-hover text-fg-secondary',
        accent: 'border-accent-border bg-accent-subtle text-accent-text',
        success: 'border-transparent bg-success-subtle text-success-text',
        warning: 'border-transparent bg-warning-subtle text-warning-text',
        danger: 'border-transparent bg-danger-subtle text-danger-text',
        info: 'border-transparent bg-info-subtle text-info-text',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

const dotTone = {
  neutral: 'bg-fg-secondary',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
} as const;

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  /** Leading status dot. */
  dot?: boolean;
  className?: string;
}

export function Badge({ tone, dot, children, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)}>
      {dot && (
        <span
          aria-hidden="true"
          className={cn('size-1.5 rounded-full', dotTone[tone ?? 'neutral'])}
        />
      )}
      {children}
    </span>
  );
}

interface TagProps {
  children: React.ReactNode;
  /** Makes the tag a toggle (filter chip). */
  selected?: boolean;
  onToggle?: () => void;
  /** Adds a remove button. */
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Tag — a theme, code or filter chip.
 *   • With onToggle it is a toggle button (aria-pressed) for filters.
 *   • With onRemove it shows a labelled remove button.
 */
export function Tag({
  children,
  selected = false,
  onToggle,
  onRemove,
  disabled,
  className,
}: TagProps) {
  const base = cn(
    'inline-flex h-7 items-center gap-1 rounded-pill border px-3 text-xs font-medium',
    'transition-colors duration-fast ease-standard',
    selected
      ? 'border-accent-border bg-accent-subtle text-accent-text'
      : 'border-border bg-surface text-fg-secondary',
    disabled && 'cursor-not-allowed border-border bg-transparent text-fg-muted',
    className,
  );

  if (onToggle) {
    return (
      <button
        type="button"
        aria-pressed={selected}
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          base,
          'focus-ring',
          !disabled && !selected && 'hover:bg-layer-hover hover:text-fg',
        )}
      >
        {children}
      </button>
    );
  }

  return (
    <span className={cn(base, onRemove && 'pr-1')}>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove ${typeof children === 'string' ? children : 'tag'}`}
          className="inline-flex size-5 items-center justify-center rounded-full text-fg-secondary transition-colors duration-fast hover:bg-layer-selected hover:text-fg focus-ring"
        >
          <X size={12} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
