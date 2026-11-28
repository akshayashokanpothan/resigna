/**
 * Research workspace types (Knowledge Model layer 1, Collect).
 * Mirrors supabase/migrations/0007_create_studies_and_sources.sql.
 */

export const STUDY_METHODS = [
  'interview',
  'survey',
  'usability_test',
  'observation',
  'diary',
  'desk_research',
  'other',
] as const;
export type StudyMethod = (typeof STUDY_METHODS)[number];

export const STUDY_STATUSES = ['planned', 'active', 'completed', 'archived'] as const;
export type StudyStatus = (typeof STUDY_STATUSES)[number];

export const CONSENT_STATUSES = ['pending', 'granted', 'limited', 'withdrawn'] as const;
export type ConsentStatus = (typeof CONSENT_STATUSES)[number];

export const SOURCE_TYPES = [
  'interview_transcript',
  'recording',
  'document',
  'notes',
  'survey_response',
  'feedback',
  'support_ticket',
  'spreadsheet',
  'observation',
  'other',
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export type SourceInputMethod = 'file' | 'paste';
export type SourceStatus = 'pending' | 'extracting' | 'normalizing' | 'ready' | 'failed';

export interface Study {
  id: string;
  projectId: string;
  title: string;
  goal: string | null;
  researchQuestions: string[];
  methods: StudyMethod[];
  status: StudyStatus;
  startsOn: string | null;
  endsOn: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudyInput {
  title: string;
  goal: string | null;
  researchQuestions: string[];
  methods: StudyMethod[];
  status: StudyStatus;
  startsOn: string | null;
  endsOn: string | null;
}

export interface Participant {
  id: string;
  projectId: string;
  label: string;
  attributes: Record<string, string>;
  consentStatus: ConsentStatus;
  consentRecordedAt: string | null;
  consentNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantInput {
  label: string;
  attributes: Record<string, string>;
  consentStatus: ConsentStatus;
  consentNotes: string | null;
}

/** A source without its (possibly large) text, for lists. */
export interface ResearchSourceSummary {
  id: string;
  projectId: string;
  studyId: string;
  participantId: string | null;
  title: string;
  sourceType: SourceType;
  conductedAt: string | null;
  inputMethod: SourceInputMethod;
  originalFilename: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  isSensitive: boolean;
  status: SourceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchSource extends ResearchSourceSummary {
  contentText: string | null;
  storagePath: string | null;
}

export interface SourceMetadataInput {
  title: string;
  sourceType: SourceType;
  conductedAt: string | null;
  participantId: string | null;
  isSensitive: boolean;
}

export type CreateSourceInput = SourceMetadataInput & {
  projectId: string;
  studyId: string;
  createdBy: string;
} & (
    | { inputMethod: 'paste'; contentText: string }
    | { inputMethod: 'file'; file: File; contentText: string | null }
  );

export interface ProjectResearchCounts {
  studies: number;
  sources: number;
  participants: number;
}

export interface SearchResults {
  projects: { id: string; name: string; description: string | null }[];
  studies: { id: string; projectId: string; title: string; goal: string | null }[];
  sources: {
    id: string;
    projectId: string;
    studyId: string;
    title: string;
    sourceType: SourceType;
    /** A short piece of the source text around the match, when the match is in the text. */
    snippet: string | null;
  }[];
}
