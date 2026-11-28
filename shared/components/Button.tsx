import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

/**
 * Button — the one way to trigger an action.
 *
 * Hierarchy (one primary per view):
 *   primary   — the main action of a page or dialog
 *   secondary — alternative actions next to a primary
 *   tertiary  — low-emphasis action that still needs an outline (e.g. "Add filter")
 *   ghost     — toolbar and inline actions
 *   danger    — destructive actions; always pair with a confirmation
 *
 * For a link that looks like a button, use buttonVariants() on <Link>.
 */
export const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap',
    'rounded-control font-medium transition-colors duration-fast ease-standard',
    'focus-ring',
    'disabled:pointer-events-none aria-disabled:pointer-events-none',
    'disabled:border-transparent disabled:bg-layer-hover disabled:text-fg-muted',
    'aria-busy:cursor-progress',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-active',
        secondary:
          'border border-border-strong bg-transparent text-fg hover:bg-layer-hover active:bg-layer-selected',
        tertiary:
          'border border-accent-border bg-transparent text-accent-text hover:bg-accent-subtle active:bg-accent-subtle',
        ghost:
          'bg-transparent text-fg-secondary hover:bg-layer-hover hover:text-fg active:bg-layer-selected disabled:bg-transparent',
        danger:
          'bg-danger-solid text-on-accent hover:bg-danger-solid-hover active:bg-danger-solid-hover',
      },
      size: {
        sm: 'h-7 px-2.5 text-xs [&_svg]:size-3.5',
        md: 'h-8 px-3 text-sm [&_svg]:size-4',
        lg: 'h-10 px-4 text-sm [&_svg]:size-4',
      },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Icon shown before the label. */
  leadingIcon?: LucideIcon;
  /** Icon shown after the label. */
  trailingIcon?: LucideIcon;
  /** Pending state: disables the button, sets aria-busy, and swaps the label for loadingText. */
  isLoading?: boolean;
  /** Label while isLoading — say what is happening ("Creating…"), not "Loading". */
  loadingText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    fullWidth,
    type = 'button',
    leadingIcon: LeadingIcon,
    trailingIcon: TrailingIcon,
    isLoading = false,
    loadingText,
    disabled,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {LeadingIcon && <LeadingIcon aria-hidden="true" />}
      {isLoading && loadingText ? loadingText : children}
      {TrailingIcon && <TrailingIcon aria-hidden="true" />}
    </button>
  );
});
