import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '@/shared/errors/AppError';
import { ErrorCode } from '@/shared/errors/error-codes';
import { postgrestOrIlike, sourceStoragePath } from '../domain/research.domain';
import type {
  ConsentStatus,
  CreateSourceInput,
  Participant,
  ParticipantInput,
  ProjectResearchCounts,
  ResearchSource,
  ResearchSourceSummary,
  SearchResults,
  SourceInputMethod,
  SourceMetadataInput,
  SourceStatus,
  SourceType,
  Study,
  StudyInput,
  StudyMethod,
  StudyStatus,
} from '../types/research.types';
import type { ResearchRepository } from './research.repository';

export const SOURCES_BUCKET = 'research-sources';

type Row = Record<string, unknown>;

const SOURCE_SUMMARY_COLUMNS =
  'id, project_id, study_id, participant_id, title, source_type, conducted_at, input_method, original_filename, mime_type, size_bytes, is_sensitive, status, created_at, updated_at';

function fail(code: ErrorCode, error: PostgrestError | Error | { message: string }): never {
  throw new AppError({ code, message: error.message, cause: error });
}

function mapStudy(row: Row): Study {
  return {
    id: row['id'] as string,
    projectId: row['project_id'] as string,
    title: row['title'] as string,
    goal: (row['goal'] as string | null) ?? null,
    researchQuestions: (row['research_questions'] as string[] | null) ?? [],
    methods: (row['methods'] as StudyMethod[] | null) ?? [],
    status: row['status'] as StudyStatus,
    startsOn: (row['starts_on'] as string | null) ?? null,
    endsOn: (row['ends_on'] as string | null) ?? null,
    createdBy: (row['created_by'] as string | null) ?? null,
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
  };
}

function studyRow(input: StudyInput) {
  return {
    title: input.title,
    goal: input.goal,
    research_questions: input.researchQuestions,
    methods: input.methods,
    status: input.status,
    starts_on: input.startsOn,
    ends_on: input.endsOn,
  };
}

function mapParticipant(row: Row): Participant {
  const attributes = (row['attributes'] as Record<string, unknown> | null) ?? {};
  return {
    id: row['id'] as string,
    projectId: row['project_id'] as string,
    label: row['label'] as string,
    attributes: Object.fromEntries(Object.entries(attributes).map(([k, v]) => [k, String(v)])),
    consentStatus: row['consent_status'] as ConsentStatus,
    consentRecordedAt: (row['consent_recorded_at'] as string | null) ?? null,
    consentNotes: (row['consent_notes'] as string | null) ?? null,
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
  };
}

function mapSourceSummary(row: Row): ResearchSourceSummary {
  return {
    id: row['id'] as string,
    projectId: row['project_id'] as string,
    studyId: row['study_id'] as string,
    participantId: (row['participant_id'] as string | null) ?? null,
    title: row['title'] as string,
    sourceType: row['source_type'] as SourceType,
    conductedAt: (row['conducted_at'] as string | null) ?? null,
    inputMethod: row['input_method'] as SourceInputMethod,
    originalFilename: (row['original_filename'] as string | null) ?? null,
    mimeType: (row['mime_type'] as string | null) ?? null,
    sizeBytes: (row['size_bytes'] as number | null) ?? null,
    isSensitive: Boolean(row['is_sensitive']),
    status: row['status'] as SourceStatus,
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
  };
}

function mapSource(row: Row): ResearchSource {
  return {
    ...mapSourceSummary(row),
    contentText: (row['content_text'] as string | null) ?? null,
    storagePath: (row['storage_path'] as string | null) ?? null,
  };
}

async function sha256Hex(text: string): Promise<string | null> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return null;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export class SupabaseResearchRepository implements ResearchRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async countsForProject(projectId: string): Promise<ProjectResearchCounts> {
    const count = async (table: string) => {
      const { count: n, error } = await this.supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId);
      if (error) fail(ErrorCode.RESEARCH_LOAD_FAILED, error);
      return n ?? 0;
    };
    const [studies, sources, participants] = await Promise.all([
      count('studies'),
      count('research_sources'),
      count('participants'),
    ]);
    return { studies, sources, participants };
  }

  // Studies ------------------------------------------------------------------

  async listStudies(projectId: string): Promise<Study[]> {
    const { data, error } = await this.supabase
      .from('studies')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (error) fail(ErrorCode.RESEARCH_LOAD_FAILED, error);
    return (data ?? []).map((r) => mapStudy(r as Row));
  }

  async getStudy(id: string): Promise<Study | null> {
    const { data, error } = await this.supabase
      .from('studies')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    // An id that isn't a uuid is just "not found".
    if (error) {
      if (error.code === '22P02') return null;
      fail(ErrorCode.RESEARCH_LOAD_FAILED, error);
    }
    return data ? mapStudy(data as Row) : null;
  }

  async createStudy(projectId: string, createdBy: string, input: StudyInput): Promise<Study> {
    const { data, error } = await this.supabase
      .from('studies')
      .insert({ project_id: projectId, created_by: createdBy, ...studyRow(input) })
      .select()
      .single();
    if (error) fail(ErrorCode.RESEARCH_SAVE_FAILED, error);
    return mapStudy(data as Row);
  }

  async updateStudy(id: string, input: StudyInput): Promise<Study> {
    const { data, error } = await this.supabase
      .from('studies')
      .update(studyRow(input))
      .eq('id', id)
      .select()
      .single();
    if (error) fail(ErrorCode.RESEARCH_SAVE_FAILED, error);
    return mapStudy(data as Row);
  }

  async deleteStudy(id: string): Promise<void> {
    // Remove uploaded files first; the rows cascade with the study.
    const { data: files, error: listError } = await this.supabase
      .from('research_sources')
      .select('storage_path')
      .eq('study_id', id)
      .not('storage_path', 'is', null);
    if (listError) fail(ErrorCode.RESEARCH_SAVE_FAILED, listError);

    const { error } = await this.supabase.from('studies').delete().eq('id', id);
    if (error) fail(ErrorCode.RESEARCH_SAVE_FAILED, error);

    await this.removeFiles((files ?? []).map((f) => f['storage_path'] as string));
  }

  // Participants -------------------------------------------------------------

  async listParticipants(projectId: string): Promise<Participant[]> {
    const { data, error } = await this.supabase
      .from('participants')
      .select('*')
      .eq('project_id', projectId)
      .order('label', { ascending: true });
    if (error) fail(ErrorCode.RESEARCH_LOAD_FAILED, error);
    return (data ?? []).map((r) => mapParticipant(r as Row));
  }

  private participantRow(input: ParticipantInput, previous?: Participant) {
    const consentChanged = !previous || previous.consentStatus !== input.consentStatus;
    return {
      label: input.label,
      attributes: input.attributes,
      consent_status: input.consentStatus,
      consent_notes: input.consentNotes,
      // Record when consent was last set, so the history is auditable.
      consent_recorded_at:
        input.consentStatus === 'pending'
          ? null
          : consentChanged
            ? new Date().toISOString()
            : (previous?.consentRecordedAt ?? new Date().toISOString()),
    };
  }

  private participantError(error: PostgrestError): never {
    if (error.code === '23505') {
      throw new AppError({
        code: ErrorCode.PARTICIPANT_LABEL_TAKEN,
        message: 'Another participant in this project already has that label.',
        statusCode: 409,
        cause: error,
      });
    }
    fail(ErrorCode.RESEARCH_SAVE_FAILED, error);
  }

  async createParticipant(
    projectId: string,
    createdBy: string,
    input: ParticipantInput,
  ): Promise<Participant> {
    const { data, error } = await this.supabase
      .from('participants')
      .insert({ project_id: projectId, created_by: createdBy, ...this.participantRow(input) })
      .select()
      .single();
    if (error) this.participantError(error);
    return mapParticipant(data as Row);
  }

  async updateParticipant(id: string, input: ParticipantInput): Promise<Participant> {
    const { data: current, error: readError } = await this.supabase
      .from('participants')
      .select('*')
      .eq('id', id)
      .single();
    if (readError) fail(ErrorCode.RESEARCH_SAVE_FAILED, readError);

    const { data, error } = await this.supabase
      .from('participants')
      .update(this.participantRow(input, mapParticipant(current as Row)))
      .eq('id', id)
      .select()
      .single();
    if (error) this.participantError(error);
    return mapParticipant(data as Row);
  }

  async purgeParticipant(id: string): Promise<void> {
    const { data, error } = await this.supabase.rpc('purge_participant', {
      p_participant_id: id,
    });
    if (error) fail(ErrorCode.PARTICIPANT_PURGE_FAILED, error);
    await this.removeFiles((data as string[] | null) ?? []);
  }

  // Sources ------------------------------------------------------------------

  async listSources(filter: {
    projectId: string;
    studyId?: string;
  }): Promise<ResearchSourceSummary[]> {
    let query = this.supabase
      .from('research_sources')
      .select(SOURCE_SUMMARY_COLUMNS)
      .eq('project_id', filter.projectId);
    if (filter.studyId) query = query.eq('study_id', filter.studyId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) fail(ErrorCode.RESEARCH_LOAD_FAILED, error);
    return (data ?? []).map((r) => mapSourceSummary(r as Row));
  }

  async getSource(id: string): Promise<ResearchSource | null> {
    const { data, error } = await this.supabase
      .from('research_sources')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      if (error.code === '22P02') return null;
      fail(ErrorCode.RESEARCH_LOAD_FAILED, error);
    }
    return data ? mapSource(data as Row) : null;
  }

  async createSource(input: CreateSourceInput): Promise<ResearchSourceSummary> {
    const id = crypto.randomUUID();
    const text = input.contentText;
    const base = {
      id,
      project_id: input.projectId,
      study_id: input.studyId,
      participant_id: input.participantId,
      title: input.title,
      source_type: input.sourceType,
      conducted_at: input.conductedAt,
      is_sensitive: input.isSensitive,
      created_by: input.createdBy,
      input_method: input.inputMethod,
      content_text: text,
      content_sha256: text ? await sha256Hex(text) : null,
      // Text we already have is ready to read; other files wait for extraction (Phase 3).
      status: text ? 'ready' : 'pending',
    };

    let row: Record<string, unknown> = base;
    if (input.inputMethod === 'file') {
      const path = sourceStoragePath(input.projectId, id, input.file.name);
      const { error: uploadError } = await this.supabase.storage
        .from(SOURCES_BUCKET)
        .upload(path, input.file, {
          contentType: input.file.type || 'application/octet-stream',
          upsert: false,
        });
      if (uploadError) fail(ErrorCode.SOURCE_UPLOAD_FAILED, uploadError);
      row = {
        ...base,
        storage_path: path,
        original_filename: input.file.name,
        mime_type: input.file.type || null,
        size_bytes: input.file.size,
      };
    }

    const { data, error } = await this.supabase
      .from('research_sources')
      .insert(row)
      .select(SOURCE_SUMMARY_COLUMNS)
      .single();
    if (error) {
      // Don't leave an orphaned file behind.
      if (typeof row['storage_path'] === 'string') await this.removeFiles([row['storage_path']]);
      fail(ErrorCode.RESEARCH_SAVE_FAILED, error);
    }
    return mapSourceSummary(data as Row);
  }

  async updateSourceMetadata(
    id: string,
    input: SourceMetadataInput,
  ): Promise<ResearchSourceSummary> {
    const { data, error } = await this.supabase
      .from('research_sources')
      .update({
        title: input.title,
        source_type: input.sourceType,
        conducted_at: input.conductedAt,
        participant_id: input.participantId,
        is_sensitive: input.isSensitive,
      })
      .eq('id', id)
      .select(SOURCE_SUMMARY_COLUMNS)
      .single();
    if (error) fail(ErrorCode.RESEARCH_SAVE_FAILED, error);
    return mapSourceSummary(data as Row);
  }

  async deleteSource(id: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('research_sources')
      .delete()
      .eq('id', id)
      .select('storage_path');
    if (error) fail(ErrorCode.RESEARCH_SAVE_FAILED, error);
    await this.removeFiles(
      (data ?? []).map((r) => r['storage_path'] as string | null).filter(Boolean) as string[],
    );
  }

  async sourceDownloadUrl(storagePath: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(SOURCES_BUCKET)
      .createSignedUrl(storagePath, 60, { download: true });
    if (error || !data) fail(ErrorCode.RESEARCH_LOAD_FAILED, error ?? { message: 'No URL' });
    return data.signedUrl;
  }

  /** Best effort: the rows are already gone, so a failed file removal is only logged. */
  private async removeFiles(paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    const { error } = await this.supabase.storage.from(SOURCES_BUCKET).remove(paths);
    if (error) console.warn('[research] could not remove uploaded files', error.message);
  }

  // Search -------------------------------------------------------------------

  async search(workspaceId: string, term: string): Promise<SearchResults> {
    const { data: projectRows, error: projectError } = await this.supabase
      .from('projects')
      .select('id, name, description')
      .eq('workspace_id', workspaceId);
    if (projectError) fail(ErrorCode.SEARCH_FAILED, projectError);

    const projectIds = (projectRows ?? []).map((p) => p['id'] as string);
    if (projectIds.length === 0) return { projects: [], studies: [], sources: [] };

    const needle = term.toLowerCase();
    const projects = (projectRows ?? [])
      .filter(
        (p) =>
          String(p['name']).toLowerCase().includes(needle) ||
          String(p['description'] ?? '')
            .toLowerCase()
            .includes(needle),
      )
      .map((p) => ({
        id: p['id'] as string,
        name: p['name'] as string,
        description: (p['description'] as string | null) ?? null,
      }));

    const [studies, sources] = await Promise.all([
      this.supabase
        .from('studies')
        .select('id, project_id, title, goal')
        .in('project_id', projectIds)
        .or(postgrestOrIlike(['title', 'goal'], term))
        .order('updated_at', { ascending: false })
        .limit(20),
      this.supabase.rpc('search_research_sources', {
        p_workspace_id: workspaceId,
        p_term: term,
      }),
    ]);
    if (studies.error) fail(ErrorCode.SEARCH_FAILED, studies.error);
    if (sources.error) fail(ErrorCode.SEARCH_FAILED, sources.error);

    return {
      projects,
      studies: (studies.data ?? []).map((s) => ({
        id: s['id'] as string,
        projectId: s['project_id'] as string,
        title: s['title'] as string,
        goal: (s['goal'] as string | null) ?? null,
      })),
      sources: ((sources.data as Row[] | null) ?? []).map((s) => ({
        id: s['id'] as string,
        projectId: s['project_id'] as string,
        studyId: s['study_id'] as string,
        title: s['title'] as string,
        sourceType: s['source_type'] as SourceType,
        snippet: (s['snippet'] as string | null) ?? null,
      })),
    };
  }
}
