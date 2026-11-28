'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/Button';
import { Field } from '@/shared/components/Field';
import { Input, Textarea } from '@/shared/components/Input';
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
      <Field id="project-name" label="Name" error={errors.name?.message}>
        <Input
          autoComplete="off"
          maxLength={PROJECT_NAME_MAX}
          placeholder="Checkout redesign interviews"
          {...register('name')}
        />
      </Field>

      <Field
        id="project-description"
        label="Description"
        optional
        helperText="What are you researching, and for whom?"
        error={errors.description?.message}
      >
        <Textarea
          rows={3}
          maxLength={PROJECT_DESCRIPTION_MAX}
          placeholder="Five interviews with returning shoppers about checkout trust"
          {...register('description')}
        />
      </Field>

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending} loadingText={pendingLabel}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
