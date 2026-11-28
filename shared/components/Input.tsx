'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useFieldControl } from './Field';

/** Shared look for every text-entry control. */
export const controlVariants = cva(
  [
    'w-full rounded-control border bg-canvas text-fg transition-colors duration-fast ease-standard',
    'border-border-strong placeholder:text-fg-muted',
    'hover:border-fg-secondary',
    'focus-visible:border-focus focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus',
    'aria-invalid:border-danger aria-invalid:hover:border-danger',
    'aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:ring-danger',
    'disabled:cursor-not-allowed disabled:border-border disabled:bg-layer-hover disabled:text-fg-muted',
    'read-only:border-border read-only:bg-surface read-only:hover:border-border',
  ],
  {
    variants: {
      size: {
        sm: 'h-7 px-2.5 text-xs',
        md: 'h-8 px-3 text-sm',
        lg: 'h-10 px-3 text-sm',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

type ControlAriaProps = Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  'id' | 'aria-describedby' | 'aria-invalid' | 'required'
>;

function useControlProps(props: ControlAriaProps): ControlAriaProps {
  const field = useFieldControl();
  return {
    id: props.id ?? field?.id,
    'aria-describedby': props['aria-describedby'] ?? field?.describedBy,
    'aria-invalid': props['aria-invalid'] ?? (field?.invalid || undefined),
    required: props.required ?? (field?.required || undefined),
  };
}

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof controlVariants> {
  /** Icon inside the field, before the text (e.g. Search). */
  leadingIcon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, size, leadingIcon: Icon, type = 'text', ...props },
  ref,
) {
  const control = useControlProps(props);
  const input = (
    <input
      ref={ref}
      type={type}
      {...props}
      {...control}
      className={cn(controlVariants({ size }), Icon && 'pl-8', className)}
    />
  );
  if (!Icon) return input;
  return (
    <div className="relative">
      <Icon
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-secondary"
      />
      {input}
    </div>
  );
});

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, rows = 3, ...props },
  ref,
) {
  const control = useControlProps(props);
  return (
    <textarea
      ref={ref}
      rows={rows}
      {...props}
      {...control}
      className={cn(controlVariants({ size: 'md' }), 'h-auto resize-y py-2 leading-5', className)}
    />
  );
});

export interface SelectProps
  extends
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof controlVariants> {}

/** Native select, styled. Keyboard and screen-reader behaviour come from the browser. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, size, children, ...props },
  ref,
) {
  const control = useControlProps(props);
  return (
    <div className="relative">
      <select
        ref={ref}
        {...props}
        {...control}
        className={cn(controlVariants({ size }), 'cursor-pointer appearance-none pr-8', className)}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-secondary"
      />
    </div>
  );
});
