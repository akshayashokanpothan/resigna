'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Tooltip } from './Tooltip';

const iconButtonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center rounded-control',
    'transition-colors duration-fast ease-standard focus-ring',
    'disabled:pointer-events-none disabled:text-fg-muted',
  ],
  {
    variants: {
      variant: {
        ghost: 'text-fg-secondary hover:bg-layer-hover hover:text-fg active:bg-layer-selected',
        secondary:
          'border border-border-strong text-fg hover:bg-layer-hover active:bg-layer-selected',
        primary: 'bg-accent text-on-accent hover:bg-accent-hover',
      },
      size: {
        sm: 'size-7 [&_svg]:size-3.5',
        md: 'size-8 [&_svg]:size-4',
        lg: 'size-10 [&_svg]:size-4',
      },
      selected: { true: 'bg-layer-selected text-fg' },
    },
    defaultVariants: { variant: 'ghost', size: 'md' },
  },
);

export interface IconButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof iconButtonVariants> {
  icon: LucideIcon;
  /** Required: the accessible name, also shown as the tooltip. */
  label: string;
  /** Keyboard shortcut shown in the tooltip, e.g. "⌘K". */
  shortcut?: string;
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
}

/** Icon-only button. Always has an accessible name and a tooltip that repeats it. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon: Icon,
    label,
    shortcut,
    tooltipSide = 'bottom',
    variant,
    size,
    selected,
    className,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <Tooltip content={label} shortcut={shortcut} side={tooltipSide}>
      <button
        ref={ref}
        type={type}
        aria-label={label}
        className={cn(iconButtonVariants({ variant, size, selected }), className)}
        {...props}
      >
        <Icon aria-hidden="true" />
      </button>
    </Tooltip>
  );
});
