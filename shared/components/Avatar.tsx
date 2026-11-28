import { cn } from '@/shared/utils/cn';
import { initials } from '@/shared/utils/format';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Decorative when a visible name sits next to it. */
  decorative?: boolean;
}

/** Avatar — initials on a neutral tile. Indigo is reserved for actions and signals. */
export function Avatar({ name, size = 'md', className, decorative = true }: AvatarProps) {
  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border border-border-strong bg-layer-selected font-semibold text-fg',
        { sm: 'size-5 text-2xs', md: 'size-6 text-2xs', lg: 'size-8 text-xs' }[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
