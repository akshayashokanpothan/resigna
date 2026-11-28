import { z } from 'zod';
import {
  CONSENT_STATUSES,
  SOURCE_TYPES,
  STUDY_METHODS,
  STUDY_STATUSES,
} from '../types/research.types';

export const STUDY_TITLE_MAX = 200;
export const STUDY_GOAL_MAX = 2000;
export const SOURCE_TITLE_MAX = 200;
export const PARTICIPANT_LABEL_MAX = 100;
/** Pasted text limit: about 200,000 words, far beyond a long interview. */
export const PASTED_TEXT_MAX = 1_000_000;

const isoDate = z
  .string()
  .trim()
  .refine((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Enter a valid date')
  .optional();

/** What the user types into the create and edit study forms. */
export const studyFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Give the study a title')
      .max(STUDY_TITLE_MAX, `Title must be ${STUDY_TITLE_MAX} characters or fewer`),
    goal: z
      .string()
      .trim()
      .max(STUDY_GOAL_MAX, `Goal must be ${STUDY_GOAL_MAX} characters or fewer`)
      .optional(),
    researchQuestions: z.string().optional(),
    methods: z.array(z.enum(STUDY_METHODS)),
    status: z.enum(STUDY_STATUSES),
    startsOn: isoDate,
    endsOn: isoDate,
  })
  .refine((v) => !v.startsOn || !v.endsOn || v.endsOn >= v.startsOn, {
    message: 'The end date must be on or after the start date',
    path: ['endsOn'],
  });

export type StudyFormValues = z.infer<typeof studyFormSchema>;

export const participantFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'Give the participant a label, such as P01')
    .max(PARTICIPANT_LABEL_MAX, `Label must be ${PARTICIPANT_LABEL_MAX} characters or fewer`),
  attributes: z.string().optional(),
  consentStatus: z.enum(CONSENT_STATUSES),
  consentNotes: z.string().trim().max(2000, 'Notes must be 2000 characters or fewer').optional(),
});

export type ParticipantFormValues = z.infer<typeof participantFormSchema>;

/** Metadata shared by pasted and uploaded sources. */
export const sourceMetadataSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Give the source a title')
    .max(SOURCE_TITLE_MAX, `Title must be ${SOURCE_TITLE_MAX} characters or fewer`),
  sourceType: z.enum(SOURCE_TYPES),
  conductedAt: isoDate,
  participantId: z.string().optional(),
  isSensitive: z.boolean(),
});

export const pasteSourceSchema = sourceMetadataSchema.extend({
  contentText: z
    .string()
    .refine((v) => v.trim().length > 0, 'Paste the transcript or notes')
    .refine((v) => v.length <= PASTED_TEXT_MAX, 'This text is too long to paste. Upload a file.'),
});

export type SourceMetadataValues = z.infer<typeof sourceMetadataSchema>;
export type PasteSourceValues = z.infer<typeof pasteSourceSchema>;
