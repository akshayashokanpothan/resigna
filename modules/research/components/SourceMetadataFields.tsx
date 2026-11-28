'use client';

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Checkbox } from '@/shared/components/Choice';
import { Field } from '@/shared/components/Field';
import { Input, Select } from '@/shared/components/Input';
import { CONSENT_META, SOURCE_TYPE_LABELS } from '../domain/research.domain';
import { SOURCE_TITLE_MAX, type SourceMetadataValues } from '../schemas/research.schema';
import { SOURCE_TYPES, type Participant } from '../types/research.types';

interface SourceMetadataFieldsProps {
  // Any form whose values include the source metadata fields.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  errors: FieldErrors<SourceMetadataValues>;
  participants: Participant[];
}

/** Title, type, date, participant and sensitivity: shared by the add and edit forms. */
export function SourceMetadataFields({
  register,
  errors,
  participants,
}: SourceMetadataFieldsProps) {
  return (
    <>
      <Field id="source-title" label="Title" error={errors.title?.message}>
        <Input
          autoComplete="off"
          maxLength={SOURCE_TITLE_MAX}
          placeholder="Interview with P03"
          {...register('title')}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="source-type" label="Type">
          <Select {...register('sourceType')}>
            {SOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {SOURCE_TYPE_LABELS[type]}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="source-date" label="Date conducted" optional error={errors.conductedAt?.message}>
          <Input type="date" {...register('conductedAt')} />
        </Field>
      </div>

      <Field
        id="source-participant"
        label="Participant"
        optional
        helperText={
          participants.length === 0
            ? 'Add participants on the project’s Participants tab to link them here.'
            : undefined
        }
      >
        <Select {...register('participantId')} disabled={participants.length === 0}>
          <option value="">No participant</option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
              {p.consentStatus !== 'granted' ? ` (${CONSENT_META[p.consentStatus].label})` : ''}
            </option>
          ))}
        </Select>
      </Field>

      <Checkbox
        label="Contains sensitive information"
        description="Health, financial or other personal details. Sensitive sources are marked everywhere they appear."
        {...register('isSensitive')}
      />
    </>
  );
}
