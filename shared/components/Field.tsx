'use client';

import { createContext, useContext, useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface FieldContextValue {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/** Used by Input, Textarea and Select to pick up the id, description and invalid state. */
export function useFieldControl(): FieldContextValue | null {
  return useContext(FieldContext);
}

interface FieldProps {
  label: string;
  /** Visually hide the label (it stays available to screen readers). */
  hideLabel?: boolean;
  /** Short guidance under the control. Replaced by the error when there is one. */
  helperText?: string;
  /** Validation message. Say what is wrong and how to fix it. */
  error?: string;
  /** Marks the field as required for assistive tech. Visible marker: optional fields say "(optional)". */
  required?: boolean;
  optional?: boolean;
  /** Use a specific id for the control (otherwise one is generated). */
  id?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Field — label + control + helper/error text, wired together for assistive tech.
 * Put exactly one Input, Textarea or Select inside.
 */
export function Field({
  label,
  hideLabel,
  helperText,
  error,
  required = false,
  optional = false,
  id: idProp,
  className,
  children,
}: FieldProps) {
  const generated = useId();
  const id = idProp ?? generated;
  const messageId = `${id}-message`;
  const message = error ?? helperText;

  return (
    <FieldContext.Provider
      value={{ id, describedBy: message ? messageId : undefined, invalid: !!error, required }}
    >
      <div className={cn('flex flex-col gap-1.5', className)}>
        <label htmlFor={id} className={cn('type-label text-fg-secondary', hideLabel && 'sr-only')}>
          {label}
          {optional && <span className="font-normal text-fg-secondary"> (optional)</span>}
        </label>
        {children}
        {message && (
          <p
            id={messageId}
            className={cn(
              'flex items-start gap-1.5 type-caption',
              error ? 'text-danger-text' : 'text-fg-secondary',
            )}
          >
            {error && <AlertCircle size={14} className="mt-px shrink-0" aria-hidden="true" />}
            {message}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
}
