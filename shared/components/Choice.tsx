'use client';

import { forwardRef, useId } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface ChoiceLabelProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
}

/** Label + description. The description is linked with aria-describedby, not part of the name. */
function ChoiceText({ label, description, disabled, id }: ChoiceLabelProps & { id: string }) {
  return (
    <span className="flex flex-col">
      <label
        htmlFor={id}
        className={cn(
          'text-sm',
          disabled ? 'cursor-not-allowed text-fg-muted' : 'cursor-pointer text-fg',
        )}
      >
        {label}
      </label>
      {description && (
        <span id={`${id}-desc`} className="type-caption text-fg-secondary">
          {description}
        </span>
      )}
    </span>
  );
}

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>, ChoiceLabelProps {
  /** Mixed state, e.g. "select all" when only some rows are selected. */
  indeterminate?: boolean;
}

/** Checkbox — native input (so forms, Space key and screen readers just work), custom visuals. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, indeterminate = false, disabled, className, id: idProp, ...props },
  ref,
) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <div className={cn('group inline-flex items-start gap-2.5', className)}>
      <span className="relative mt-0.5 inline-flex size-4 shrink-0">
        <input
          ref={(node) => {
            if (node) node.indeterminate = indeterminate;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          id={id}
          type="checkbox"
          disabled={disabled}
          aria-describedby={description ? `${id}-desc` : undefined}
          aria-checked={indeterminate ? 'mixed' : undefined}
          className={cn(
            'peer size-4 cursor-pointer appearance-none disabled:cursor-not-allowed rounded-xs border border-border-strong bg-canvas',
            'transition-colors duration-fast ease-standard focus-ring',
            'group-hover:border-fg-secondary',
            'checked:border-accent checked:bg-accent group-hover:checked:border-accent-hover group-hover:checked:bg-accent-hover',
            'indeterminate:border-accent indeterminate:bg-accent',
            'disabled:border-border disabled:bg-layer-hover',
            'disabled:checked:border-border-strong disabled:checked:bg-border-strong',
          )}
          {...props}
        />
        <Check
          size={12}
          strokeWidth={3}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-0.5 top-0.5 text-on-accent opacity-0 peer-checked:opacity-100',
            indeterminate && 'peer-checked:opacity-0',
          )}
        />
        {indeterminate && (
          <Minus
            size={12}
            strokeWidth={3}
            aria-hidden="true"
            className="pointer-events-none absolute left-0.5 top-0.5 text-on-accent"
          />
        )}
      </span>
      <ChoiceText id={id} label={label} description={description} disabled={disabled} />
    </div>
  );
});

export type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> &
  ChoiceLabelProps;

/** Radio — use inside <RadioGroup> so arrow keys move between options. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, description, disabled, className, id: idProp, ...props },
  ref,
) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <div className={cn('group inline-flex items-start gap-2.5', className)}>
      <span className="relative mt-0.5 inline-flex size-4 shrink-0">
        <input
          ref={ref}
          id={id}
          type="radio"
          disabled={disabled}
          aria-describedby={description ? `${id}-desc` : undefined}
          className={cn(
            'peer size-4 cursor-pointer appearance-none disabled:cursor-not-allowed rounded-full border border-border-strong bg-canvas',
            'transition-colors duration-fast ease-standard focus-ring',
            'group-hover:border-fg-secondary checked:border-accent group-hover:checked:border-accent-hover',
            'disabled:border-border disabled:bg-layer-hover disabled:checked:border-border-strong',
          )}
          {...props}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1 top-1 size-2 rounded-full bg-accent opacity-0 peer-checked:opacity-100 peer-disabled:bg-border-strong"
        />
      </span>
      <ChoiceText id={id} label={label} description={description} disabled={disabled} />
    </div>
  );
});

interface RadioGroupProps {
  legend: string;
  hideLegend?: boolean;
  children: React.ReactNode;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

/** Fieldset + legend for a set of Radio options sharing one `name`. */
export function RadioGroup({
  legend,
  hideLegend,
  children,
  orientation = 'vertical',
  className,
}: RadioGroupProps) {
  return (
    <fieldset className={cn('flex flex-col gap-2', className)}>
      <legend className={cn('mb-1 type-label text-fg-secondary', hideLegend && 'sr-only')}>
        {legend}
      </legend>
      <div
        role="radiogroup"
        className={cn('flex gap-3', orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap')}
      >
        {children}
      </div>
    </fieldset>
  );
}

interface SwitchProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
  /** Visually hide the label (it stays available to screen readers). */
  hideLabel?: boolean;
  className?: string;
}

/** Switch — for settings that take effect immediately. Use Checkbox inside forms. */
export function Switch({
  label,
  checked,
  onCheckedChange,
  description,
  disabled,
  hideLabel,
  className,
}: SwitchProps) {
  const id = useId();
  return (
    <div className={cn('inline-flex items-start gap-3', className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative mt-px inline-flex h-5 w-9 shrink-0 items-center rounded-full border',
          'transition-colors duration-fast ease-standard focus-ring',
          checked
            ? 'border-accent bg-accent hover:border-accent-hover hover:bg-accent-hover'
            : 'border-border-strong bg-layer-selected hover:border-fg-secondary',
          'disabled:cursor-not-allowed disabled:border-border disabled:bg-layer-hover',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'inline-block size-3.5 rounded-full transition-transform duration-fast ease-standard',
            checked ? 'translate-x-[18px] bg-on-accent' : 'translate-x-0.5 bg-fg-secondary',
            disabled && 'bg-fg-muted',
          )}
        />
      </button>
      <span className={cn(hideLabel && 'sr-only')}>
        <ChoiceText id={id} label={label} description={description} disabled={disabled} />
      </span>
    </div>
  );
}
