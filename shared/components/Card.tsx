import { cn } from '@/shared/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Raised cards sit on the surface layer (e.g. a card inside a panel). */
  layer?: 'surface' | 'raised';
  /** Adds hover feedback. Put the link or button inside; don't make the whole div clickable. */
  interactive?: boolean;
  /** Visually marks the card as selected (pair with aria-selected/aria-current on the control). */
  selected?: boolean;
  padding?: 'none' | 'sm' | 'md';
}

/** Card — a bordered container on the surface layer. Borders first, no heavy shadows. */
export function Card({
  layer = 'surface',
  interactive,
  selected,
  padding = 'md',
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border',
        layer === 'surface' ? 'bg-surface' : 'bg-surface-raised',
        selected ? 'border-accent-border' : 'border-border',
        interactive &&
          'relative transition-colors duration-fast ease-standard hover:border-border-strong hover:bg-layer-hover focus-within:border-border-strong',
        { none: '', sm: 'p-4', md: 'p-5' }[padding],
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-3 flex items-start justify-between gap-4', className)} {...props} />
  );
}

export function CardTitle({
  as: Tag = 'h3',
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h2' | 'h3' | 'h4' }) {
  return <Tag className={cn('type-heading-sm text-fg', className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-0.5 type-body-sm text-fg-secondary', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-4 flex items-center justify-end gap-2 border-t border-border pt-4',
        className,
      )}
      {...props}
    />
  );
}
