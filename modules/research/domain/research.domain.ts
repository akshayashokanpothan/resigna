/**
 * Pure research-workspace rules: labels, parsing and file handling.
 * No I/O here, so everything is unit tested.
 */
import type {
  ConsentStatus,
  SourceStatus,
  SourceType,
  StudyMethod,
  StudyStatus,
} from '../types/research.types';

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export const STUDY_METHOD_LABELS: Record<StudyMethod, string> = {
  interview: 'Interviews',
  survey: 'Survey',
  usability_test: 'Usability test',
  observation: 'Observation',
  diary: 'Diary study',
  desk_research: 'Desk research',
  other: 'Other',
};

export const STUDY_STATUS_META: Record<StudyStatus, { label: string; tone: Tone }> = {
  planned: { label: 'Planned', tone: 'neutral' },
  active: { label: 'In progress', tone: 'accent' },
  completed: { label: 'Completed', tone: 'success' },
  archived: { label: 'Archived', tone: 'neutral' },
};

export const CONSENT_META: Record<
  ConsentStatus,
  { label: string; tone: Tone; description: string }
> = {
  pending: {
    label: 'Consent pending',
    tone: 'warning',
    description: 'Not recorded yet.',
  },
  granted: {
    label: 'Consent granted',
    tone: 'success',
    description: 'Their research can be used in full.',
  },
  limited: {
    label: 'Limited consent',
    tone: 'info',
    description: 'Use with the limits in the notes.',
  },
  withdrawn: {
    label: 'Consent withdrawn',
    tone: 'danger',
    description: 'Keep out of analysis. Delete their data if they ask.',
  },
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  interview_transcript: 'Interview transcript',
  recording: 'Recording',
  document: 'Document',
  notes: 'Notes',
  survey_response: 'Survey responses',
  feedback: 'Feedback',
  support_ticket: 'Support tickets',
  spreadsheet: 'Spreadsheet',
  observation: 'Observation notes',
  other: 'Other',
};

export const SOURCE_STATUS_META: Record<SourceStatus, { label: string; tone: Tone }> = {
  pending: { label: 'Waiting for text extraction', tone: 'neutral' },
  extracting: { label: 'Extracting text', tone: 'info' },
  normalizing: { label: 'Processing', tone: 'info' },
  ready: { label: 'Text ready', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
};

/** One research question per line; blank lines and list markers are dropped. */
export function parseResearchQuestions(text: string | undefined | null): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim())
    .filter((line) => line.length > 0);
}

export function formatResearchQuestions(questions: string[]): string {
  return questions.join('\n');
}

/**
 * Participant attributes, one "key: value" per line (for example "Role: Nurse").
 * Lines without a colon are ignored; later keys win.
 */
export function parseAttributes(text: string | undefined | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!text) return out;
  for (const line of text.split(/\r?\n/)) {
    const index = line.indexOf(':');
    if (index <= 0) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (key && value) out[key] = value;
  }
  return out;
}

export function formatAttributes(attributes: Record<string, string>): string {
  return Object.entries(attributes)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

/** Empty strings become null, so optional fields are stored as "not set". */
export function emptyToNull(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

// Files ---------------------------------------------------------------------

/** 25 MB: enough for long transcripts and documents; recordings come later. */
export const MAX_SOURCE_FILE_BYTES = 25 * 1024 * 1024;

/** Files whose text can be read in the browser right away. */
const TEXT_EXTENSIONS = ['txt', 'md', 'markdown', 'vtt', 'srt', 'csv'] as const;
/** Files kept in storage now; their text is extracted in a later release. */
const DOCUMENT_EXTENSIONS = ['pdf', 'docx'] as const;

export const ACCEPTED_SOURCE_EXTENSIONS = [...TEXT_EXTENSIONS, ...DOCUMENT_EXTENSIONS];
export const ACCEPTED_SOURCE_FILE_INPUT = ACCEPTED_SOURCE_EXTENSIONS.map((e) => `.${e}`).join(',');

export function fileExtension(filename: string): string {
  const index = filename.lastIndexOf('.');
  return index >= 0 ? filename.slice(index + 1).toLowerCase() : '';
}

export function isTextFile(filename: string): boolean {
  return (TEXT_EXTENSIONS as readonly string[]).includes(fileExtension(filename));
}

export type FileCheck = { ok: true } | { ok: false; message: string };

export function checkSourceFile(file: { name: string; size: number }): FileCheck {
  if (!ACCEPTED_SOURCE_EXTENSIONS.includes(fileExtension(file.name) as never)) {
    return {
      ok: false,
      message: `Choose a .txt, .md, .vtt, .srt, .csv, .pdf or .docx file.`,
    };
  }
  if (file.size === 0) return { ok: false, message: 'This file is empty.' };
  if (file.size > MAX_SOURCE_FILE_BYTES) {
    return { ok: false, message: 'Files can be up to 25 MB.' };
  }
  return { ok: true };
}

/** A best guess at the source type from the file name, which the user can change. */
export function guessSourceType(filename: string): SourceType {
  const ext = fileExtension(filename);
  if (ext === 'vtt' || ext === 'srt') return 'interview_transcript';
  if (ext === 'csv') return 'spreadsheet';
  if (ext === 'pdf' || ext === 'docx') return 'document';
  return /interview|transcript/i.test(filename) ? 'interview_transcript' : 'notes';
}

/** The file name without its extension, as a default title. */
export function titleFromFilename(filename: string): string {
  const index = filename.lastIndexOf('.');
  const base = (index > 0 ? filename.slice(0, index) : filename).replace(/[_-]+/g, ' ').trim();
  return base.slice(0, 200) || 'Untitled source';
}

/**
 * Storage object name for an upload: "<project>/<source>/<safe-name>".
 * The first segment must be the project id (storage RLS in 0007).
 */
export function sourceStoragePath(projectId: string, sourceId: string, filename: string): string {
  const ext = fileExtension(filename);
  const base = titleFromFilename(filename)
    .normalize('NFKD')
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 80);
  return `${projectId}/${sourceId}/${base || 'file'}${ext ? `.${ext}` : ''}`;
}

export function formatBytes(bytes: number | null): string {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function countWords(text: string | null): number {
  if (!text) return 0;
  const words = text.trim().match(/\S+/g);
  return words ? words.length : 0;
}

// Search --------------------------------------------------------------------

/** Escapes a search term for a Postgres ILIKE pattern and wraps it in wildcards. */
export function ilikePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

/**
 * Builds the value for a PostgREST `or=(…)` filter. Commas, parentheses and
 * quotes have meaning there, so the pattern is double-quoted and escaped.
 */
export function postgrestOrIlike(columns: string[], term: string): string {
  const quoted = `"${ilikePattern(term).replace(/["\\]/g, (c) => `\\${c}`)}"`;
  return columns.map((column) => `${column}.ilike.${quoted}`).join(',');
}

export const SEARCH_MIN_LENGTH = 2;

export function normalizeSearchTerm(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

/** A short excerpt of `text` around the first match of `term`, or null. */
export function searchSnippet(text: string | null, term: string, radius = 70): string | null {
  if (!text || !term) return null;
  const index = text.toLowerCase().indexOf(term.toLowerCase());
  if (index < 0) return null;
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + term.length + radius);
  const body = text.slice(start, end).replace(/\s+/g, ' ').trim();
  return `${start > 0 ? '…' : ''}${body}${end < text.length ? '…' : ''}`;
}

/** Splits text around case-insensitive matches of `term`, for highlighting. */
export function splitByMatch(text: string, term: string): { text: string; match: boolean }[] {
  if (!term) return [{ text, match: false }];
  const parts: { text: string; match: boolean }[] = [];
  const lower = text.toLowerCase();
  const needle = term.toLowerCase();
  let from = 0;
  for (let i = lower.indexOf(needle); i >= 0; i = lower.indexOf(needle, from)) {
    if (i > from) parts.push({ text: text.slice(from, i), match: false });
    parts.push({ text: text.slice(i, i + needle.length), match: true });
    from = i + needle.length;
  }
  if (from < text.length) parts.push({ text: text.slice(from), match: false });
  return parts;
}

/** The next free pseudonymous label: P01, P02, … */
export function nextParticipantLabel(existing: string[]): string {
  const used = new Set(existing.map((l) => l.trim().toUpperCase()));
  for (let n = 1; ; n++) {
    const label = `P${String(n).padStart(2, '0')}`;
    if (!used.has(label)) return label;
  }
}

/**
 * Formats a calendar date ("2026-11-28") without a time zone shift:
 * `new Date("2026-11-28")` is UTC midnight, which is the day before in the Americas.
 */
export function formatDay(isoDay: string): string {
  const [y, m, d] = isoDay.split('-').map(Number);
  if (!y || !m || !d) return isoDay;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(y, m - 1, d));
}
