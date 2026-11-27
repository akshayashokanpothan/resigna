'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/utils/cn';
import {
  PROJECT_DESCRIPTION_MAX,
  PROJECT_NAME_MAX,
  projectFormSchema,
  type ProjectFormValues,
} from '../schemas/project.schema';

interface ProjectFormProps {
  defaultValues?: ProjectFormValues;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onSubmit: (values: ProjectFormValues) => Promise<boolean>;
  onCancel: () => void;
}

const fieldClass = cn(
  'w-full rounded-md border bg-transparent px-3 text-sm outline-none transition-colors',
  'border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
  'placeholder:text-[hsl(var(--muted-foreground))]',
  'focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))]',
);

export function ProjectForm({
  defaultValues,
  submitLabel,
  pendingLabel,
  isPending,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: defaultValues ?? { name: '', description: '' },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="project-name" className="text-sm font-medium text-[hsl(var(--foreground))]">
          Name
        </label>
        <input
          id="project-name"
          type="text"
          autoComplete="off"
          maxLength={PROJECT_NAME_MAX}
          placeholder="Checkout redesign interviews"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'project-name-error' : undefined}
          {...register('name')}
          className={cn(fieldClass, 'h-9', errors.name && 'border-[hsl(var(--destructive))]')}
        />
        {errors.name && (
          <p id="project-name-error" className="text-xs text-[hsl(var(--destructive))]">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="project-description"
          className="text-sm font-medium text-[hsl(var(--foreground))]"
        >
          Description{' '}
          <span className="font-normal text-[hsl(var(--muted-foreground))]">(optional)</span>
        </label>
        <textarea
          id="project-description"
          rows={3}
          maxLength={PROJECT_DESCRIPTION_MAX}
          placeholder="What are you researching, and for whom?"
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'project-description-error' : undefined}
          {...register('description')}
          className={cn(
            fieldClass,
            'resize-none py-2',
            errors.description && 'border-[hsl(var(--destructive))]',
          )}
        />
        {errors.description && (
          <p id="project-description-error" className="text-xs text-[hsl(var(--destructive))]">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="mt-1 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
