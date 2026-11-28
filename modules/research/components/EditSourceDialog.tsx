'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/Button';
import { Dialog } from '@/shared/components/Dialog';
import { emptyToNull } from '../domain/research.domain';
import { useUpdateSourceMetadata } from '../hooks/use-research';
import { sourceMetadataSchema, type SourceMetadataValues } from '../schemas/research.schema';
import type { Participant, ResearchSourceSummary } from '../types/research.types';
import { SourceMetadataFields } from './SourceMetadataFields';

interface EditSourceDialogProps {
  source: ResearchSourceSummary;
  participants: Participant[];
  open: boolean;
  onClose: () => void;
}

function defaults(source: ResearchSourceSummary): SourceMetadataValues {
  return {
    title: source.title,
    sourceType: source.sourceType,
    conductedAt: source.conductedAt ?? '',
    participantId: source.participantId ?? '',
    isSensitive: source.isSensitive,
  };
}

/** Edits a source's details. Its text is original research and can't be edited. */
export function EditSourceDialog({ source, participants, open, onClose }: EditSourceDialogProps) {
  const update = useUpdateSourceMetadata(source.projectId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SourceMetadataValues>({
    resolver: zodResolver(sourceMetadataSchema),
    defaultValues: defaults(source),
  });

  useEffect(() => {
    if (open) reset(defaults(source));
  }, [open, source, reset]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title="Edit source details"
      description="The source text stays exactly as it was added, so evidence always matches the original."
    >
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(async (values) => {
          try {
            await update.mutateAsync({
              id: source.id,
              input: {
                title: values.title,
                sourceType: values.sourceType,
                conductedAt: emptyToNull(values.conductedAt),
                participantId: emptyToNull(values.participantId),
                isSensitive: values.isSensitive,
              },
            });
            onClose();
          } catch {
            // The mutation shows the error.
          }
        })}
      >
        <SourceMetadataFields register={register} errors={errors} participants={participants} />
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={update.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={update.isPending} loadingText="Saving…">
            Save changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
