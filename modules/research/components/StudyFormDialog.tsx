'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCurrentUser } from '@/modules/auth';
import { Button } from '@/shared/components/Button';
import { Checkbox } from '@/shared/components/Choice';
import { Dialog } from '@/shared/components/Dialog';
import { Field } from '@/shared/components/Field';
import { Input, Select, Textarea } from '@/shared/components/Input';
import { toast } from '@/shared/utils/toast';
import {
  emptyToNull,
  formatResearchQuestions,
  parseResearchQuestions,
  STUDY_METHOD_LABELS,
  STUDY_STATUS_META,
} from '../domain/research.domain';
import { useSaveStudy } from '../hooks/use-research';
import {
  STUDY_GOAL_MAX,
  STUDY_TITLE_MAX,
  studyFormSchema,
  type StudyFormValues,
} from '../schemas/research.schema';
import { STUDY_METHODS, STUDY_STATUSES, type Study } from '../types/research.types';

interface StudyFormDialogProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
  /** Edit this study; leave out to create a new one. */
  study?: Study;
  onSaved?: (study: Study) => void;
}

function defaults(study?: Study): StudyFormValues {
  return {
    title: study?.title ?? '',
    goal: study?.goal ?? '',
    researchQuestions: formatResearchQuestions(study?.researchQuestions ?? []),
    methods: study?.methods ?? [],
    status: study?.status ?? 'planned',
    startsOn: study?.startsOn ?? '',
    endsOn: study?.endsOn ?? '',
  };
}

export function StudyFormDialog({
  projectId,
  open,
  onClose,
  study,
  onSaved,
}: StudyFormDialogProps) {
  const { user } = useCurrentUser();
  const save = useSaveStudy(projectId);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudyFormValues>({
    resolver: zodResolver(studyFormSchema),
    defaultValues: defaults(study),
  });

  useEffect(() => {
    if (open) reset(defaults(study));
  }, [open, study, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!user) {
      toast.error('Your session is still loading. Please try again in a moment.');
      return;
    }
    try {
      const saved = await save.mutateAsync({
        id: study?.id,
        createdBy: user.id,
        input: {
          title: values.title,
          goal: emptyToNull(values.goal),
          researchQuestions: parseResearchQuestions(values.researchQuestions),
          methods: values.methods,
          status: values.status,
          startsOn: emptyToNull(values.startsOn),
          endsOn: emptyToNull(values.endsOn),
        },
      });
      onClose();
      onSaved?.(saved);
    } catch {
      // The mutation shows the error.
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={study ? 'Edit study' : 'New study'}
      description="A study is one piece of research, such as a round of interviews or a survey. Its sources and participants live inside it."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field id="study-title" label="Title" error={errors.title?.message}>
          <Input
            autoComplete="off"
            maxLength={STUDY_TITLE_MAX}
            placeholder="Checkout trust interviews, round 1"
            {...register('title')}
          />
        </Field>

        <Field
          id="study-goal"
          label="Research goal"
          optional
          helperText="What should this study help the team decide?"
          error={errors.goal?.message}
        >
          <Textarea
            rows={2}
            maxLength={STUDY_GOAL_MAX}
            placeholder="Understand why returning shoppers abandon checkout at the payment step"
            {...register('goal')}
          />
        </Field>

        <Field
          id="study-questions"
          label="Research questions"
          optional
          helperText="One question per line."
        >
          <Textarea
            rows={3}
            placeholder={
              'What makes shoppers trust a payment page?\nWhen do they look for reassurance?'
            }
            {...register('researchQuestions')}
          />
        </Field>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 type-label text-fg-secondary">
            Methods <span className="font-normal">(optional)</span>
          </legend>
          <Controller
            control={control}
            name="methods"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                {STUDY_METHODS.map((method) => (
                  <Checkbox
                    key={method}
                    label={STUDY_METHOD_LABELS[method]}
                    checked={field.value.includes(method)}
                    onChange={(e) =>
                      field.onChange(
                        e.target.checked
                          ? [...field.value, method]
                          : field.value.filter((m) => m !== method),
                      )
                    }
                  />
                ))}
              </div>
            )}
          />
        </fieldset>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field id="study-status" label="Status">
            <Select {...register('status')}>
              {STUDY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STUDY_STATUS_META[status].label}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="study-starts" label="Starts" optional error={errors.startsOn?.message}>
            <Input type="date" {...register('startsOn')} />
          </Field>
          <Field id="study-ends" label="Ends" optional error={errors.endsOn?.message}>
            <Input type="date" {...register('endsOn')} />
          </Field>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={save.isPending} loadingText="Saving…">
            {study ? 'Save changes' : 'Create study'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
