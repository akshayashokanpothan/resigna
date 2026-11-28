'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCurrentUser } from '@/modules/auth';
import { Button } from '@/shared/components/Button';
import { Radio, RadioGroup } from '@/shared/components/Choice';
import { Dialog } from '@/shared/components/Dialog';
import { Field } from '@/shared/components/Field';
import { Input, Textarea } from '@/shared/components/Input';
import { toast } from '@/shared/utils/toast';
import {
  CONSENT_META,
  emptyToNull,
  formatAttributes,
  parseAttributes,
} from '../domain/research.domain';
import { useSaveParticipant } from '../hooks/use-research';
import {
  PARTICIPANT_LABEL_MAX,
  participantFormSchema,
  type ParticipantFormValues,
} from '../schemas/research.schema';
import { CONSENT_STATUSES, type Participant } from '../types/research.types';

interface ParticipantFormDialogProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
  participant?: Participant;
  /** Label suggested for a new participant, such as "P04". */
  suggestedLabel?: string;
}

function defaults(participant?: Participant, suggestedLabel?: string): ParticipantFormValues {
  return {
    label: participant?.label ?? suggestedLabel ?? '',
    attributes: formatAttributes(participant?.attributes ?? {}),
    consentStatus: participant?.consentStatus ?? 'pending',
    consentNotes: participant?.consentNotes ?? '',
  };
}

export function ParticipantFormDialog({
  projectId,
  open,
  onClose,
  participant,
  suggestedLabel,
}: ParticipantFormDialogProps) {
  const { user } = useCurrentUser();
  const save = useSaveParticipant(projectId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ParticipantFormValues>({
    resolver: zodResolver(participantFormSchema),
    defaultValues: defaults(participant, suggestedLabel),
  });

  useEffect(() => {
    if (open) reset(defaults(participant, suggestedLabel));
  }, [open, participant, suggestedLabel, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!user) {
      toast.error('Your session is still loading. Please try again in a moment.');
      return;
    }
    try {
      await save.mutateAsync({
        id: participant?.id,
        createdBy: user.id,
        input: {
          label: values.label,
          attributes: parseAttributes(values.attributes),
          consentStatus: values.consentStatus,
          consentNotes: emptyToNull(values.consentNotes),
        },
      });
      onClose();
    } catch {
      // The mutation shows the error.
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={participant ? `Edit ${participant.label}` : 'Add participant'}
      description="Participants are pseudonymous: use a code, not a name. Record their consent before you use their research."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field
          id="participant-label"
          label="Label"
          helperText="A code such as P04. Keep real names and contact details out of Resigna."
          error={errors.label?.message}
        >
          <Input autoComplete="off" maxLength={PARTICIPANT_LABEL_MAX} {...register('label')} />
        </Field>

        <RadioGroup legend="Consent">
          {CONSENT_STATUSES.map((status) => (
            <Radio
              key={status}
              value={status}
              label={CONSENT_META[status].label}
              description={CONSENT_META[status].description}
              {...register('consentStatus')}
            />
          ))}
        </RadioGroup>

        <Field
          id="participant-consent-notes"
          label="Consent notes"
          optional
          helperText="Limits they set, how consent was given, or when it was withdrawn."
          error={errors.consentNotes?.message}
        >
          <Textarea rows={2} {...register('consentNotes')} />
        </Field>

        <Field
          id="participant-attributes"
          label="Attributes"
          optional
          helperText="One per line, as Name: value. For example, Role: Store manager."
        >
          <Textarea
            rows={3}
            placeholder={'Role: Store manager\nSegment: Returning shopper'}
            {...register('attributes')}
          />
        </Field>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={save.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={save.isPending} loadingText="Saving…">
            {participant ? 'Save changes' : 'Add participant'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
