'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileUp, X } from 'lucide-react';
import { useCurrentUser } from '@/modules/auth';
import { Button } from '@/shared/components/Button';
import { Dialog } from '@/shared/components/Dialog';
import { Field } from '@/shared/components/Field';
import { Select, Textarea } from '@/shared/components/Input';
import { Notification } from '@/shared/components/Notification';
import { Tabs } from '@/shared/components/Tabs';
import { cn } from '@/shared/utils/cn';
import { toast } from '@/shared/utils/toast';
import {
  ACCEPTED_SOURCE_FILE_INPUT,
  checkSourceFile,
  countWords,
  emptyToNull,
  formatBytes,
  guessSourceType,
  isTextFile,
  titleFromFilename,
} from '../domain/research.domain';
import { useCreateSource } from '../hooks/use-research';
import { PASTED_TEXT_MAX, sourceMetadataSchema } from '../schemas/research.schema';
import type { Participant, Study } from '../types/research.types';
import { SourceMetadataFields } from './SourceMetadataFields';

const addSourceSchema = sourceMetadataSchema
  .extend({
    studyId: z.string().min(1, 'Choose the study this source belongs to'),
    mode: z.enum(['paste', 'file']),
    contentText: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.mode !== 'paste') return;
    const text = v.contentText ?? '';
    if (text.trim().length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['contentText'],
        message: 'Paste the transcript or notes',
      });
    } else if (text.length > PASTED_TEXT_MAX) {
      ctx.addIssue({
        code: 'custom',
        path: ['contentText'],
        message: 'This text is too long to paste. Upload it as a file instead.',
      });
    }
  });

type AddSourceValues = z.infer<typeof addSourceSchema>;

interface AddSourceDialogProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
  studies: Study[];
  participants: Participant[];
  /** Pre-select (and lock) this study, when adding from a study page. */
  studyId?: string;
}

const MODES = [
  { id: 'paste', label: 'Paste text' },
  { id: 'file', label: 'Upload a file' },
];

export function AddSourceDialog({
  projectId,
  open,
  onClose,
  studies,
  participants,
  studyId,
}: AddSourceDialogProps) {
  const { user } = useCurrentUser();
  const create = useCreateSource(projectId);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initial = (): AddSourceValues => ({
    mode: 'paste',
    studyId: studyId ?? (studies.length === 1 ? studies[0]!.id : ''),
    title: '',
    sourceType: 'interview_transcript',
    conductedAt: '',
    participantId: '',
    isSensitive: false,
    contentText: '',
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<AddSourceValues>({
    resolver: zodResolver(addSourceSchema),
    defaultValues: initial(),
  });

  useEffect(() => {
    if (open) reset(initial());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    setFile(null);
    setFileError(null);
    setIsDragging(false);
    onClose();
  };

  const mode = useWatch({ control, name: 'mode' });
  const pasted = useWatch({ control, name: 'contentText' }) ?? '';

  const chooseFile = (chosen: File | undefined) => {
    if (!chosen) return;
    const check = checkSourceFile(chosen);
    if (!check.ok) {
      setFile(null);
      setFileError(check.message);
      return;
    }
    setFile(chosen);
    setFileError(null);
    if (!getValues('title').trim()) setValue('title', titleFromFilename(chosen.name));
    setValue('sourceType', guessSourceType(chosen.name));
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!user) {
      toast.error('Your session is still loading. Please try again in a moment.');
      return;
    }
    if (values.mode === 'file' && !file) {
      setFileError('Choose a file to upload');
      return;
    }
    const metadata = {
      projectId,
      studyId: values.studyId,
      createdBy: user.id,
      title: values.title,
      sourceType: values.sourceType,
      conductedAt: emptyToNull(values.conductedAt),
      participantId: emptyToNull(values.participantId),
      isSensitive: values.isSensitive,
    };
    try {
      if (values.mode === 'paste') {
        await create.mutateAsync({
          ...metadata,
          inputMethod: 'paste',
          contentText: values.contentText ?? '',
        });
      } else if (file) {
        const contentText = isTextFile(file.name) ? await file.text() : null;
        await create.mutateAsync({ ...metadata, inputMethod: 'file', file, contentText });
      }
      close();
    } catch {
      // The mutation shows the error.
    }
  });

  return (
    <Dialog
      open={open}
      onClose={close}
      size="lg"
      title="Add source"
      description="Bring in an interview transcript, notes or a document. The original is kept exactly as you add it."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {!studyId && (
          <Field id="source-study" label="Study" error={errors.studyId?.message}>
            <Select {...register('studyId')}>
              <option value="">Choose a study</option>
              {studies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Tabs
          label="How to add the source"
          items={MODES}
          value={mode}
          onValueChange={(id) => setValue('mode', id as AddSourceValues['mode'])}
        >
          {(selected) =>
            selected === 'paste' ? (
              <div className="pt-4">
                <Field
                  id="source-text"
                  label="Transcript or notes"
                  helperText={
                    pasted.trim()
                      ? `${countWords(pasted).toLocaleString('en-US')} words`
                      : 'Paste plain text. Speaker names such as “Interviewer:” are kept as written.'
                  }
                  error={errors.contentText?.message}
                >
                  <Textarea
                    rows={8}
                    className="font-mono text-xs leading-relaxed"
                    placeholder={
                      'Interviewer: How did you choose a payment method?\nP03: I always look for the padlock first…'
                    }
                    {...register('contentText')}
                  />
                </Field>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-4">
                <label
                  htmlFor="source-file"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    chooseFile(e.dataTransfer.files[0]);
                  }}
                  className={cn(
                    'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border border-dashed px-6 py-8 text-center',
                    'transition-colors duration-fast ease-standard focus-within:outline focus-within:outline-2 focus-within:outline-focus',
                    isDragging
                      ? 'border-accent bg-accent-subtle'
                      : fileError
                        ? 'border-danger bg-surface'
                        : 'border-border-strong bg-surface hover:bg-layer-hover',
                  )}
                >
                  <FileUp size={20} className="text-fg-secondary" aria-hidden="true" />
                  <span className="text-sm text-fg">
                    <span className="font-medium text-accent-text">Choose a file</span> or drag it
                    here
                  </span>
                  <span className="type-caption text-fg-secondary">
                    .txt, .md, .vtt, .srt, .csv, .pdf or .docx, up to 25 MB
                  </span>
                  <input
                    ref={fileInputRef}
                    id="source-file"
                    type="file"
                    accept={ACCEPTED_SOURCE_FILE_INPUT}
                    className="sr-only"
                    aria-describedby={fileError ? 'source-file-error' : undefined}
                    aria-invalid={fileError ? true : undefined}
                    onChange={(e) => chooseFile(e.target.files?.[0])}
                  />
                </label>
                {fileError && (
                  <p id="source-file-error" className="type-caption text-danger-text">
                    {fileError}
                  </p>
                )}
                {file && (
                  <div className="flex items-center gap-3 rounded-control border border-border bg-surface-raised px-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-fg">{file.name}</span>
                    <span className="type-caption text-fg-secondary">{formatBytes(file.size)}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => {
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="inline-flex size-6 items-center justify-center rounded-xs text-fg-secondary hover:bg-layer-hover hover:text-fg focus-ring"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                )}
                {file && !isTextFile(file.name) && (
                  <Notification tone="info" title="Text from PDF and Word files comes next">
                    The file is stored safely now. Resigna reads its text in the next release, so
                    you can pull evidence out of it then.
                  </Notification>
                )}
              </div>
            )
          }
        </Tabs>

        <SourceMetadataFields register={register} errors={errors} participants={participants} />

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={close} disabled={create.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={create.isPending}
            loadingText={mode === 'file' ? 'Uploading…' : 'Saving…'}
          >
            Add source
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
