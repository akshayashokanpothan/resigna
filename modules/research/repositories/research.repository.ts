import type {
  CreateSourceInput,
  Participant,
  ParticipantInput,
  ProjectResearchCounts,
  ResearchSource,
  ResearchSourceSummary,
  SearchResults,
  SourceMetadataInput,
  Study,
  StudyInput,
} from '../types/research.types';

export interface ResearchRepository {
  countsForProject(projectId: string): Promise<ProjectResearchCounts>;

  listStudies(projectId: string): Promise<Study[]>;
  getStudy(id: string): Promise<Study | null>;
  createStudy(projectId: string, createdBy: string, input: StudyInput): Promise<Study>;
  updateStudy(id: string, input: StudyInput): Promise<Study>;
  deleteStudy(id: string): Promise<void>;

  listParticipants(projectId: string): Promise<Participant[]>;
  createParticipant(
    projectId: string,
    createdBy: string,
    input: ParticipantInput,
  ): Promise<Participant>;
  updateParticipant(id: string, input: ParticipantInput): Promise<Participant>;
  /** Deletes the participant, their sources, evidence and uploaded files. */
  purgeParticipant(id: string): Promise<void>;

  listSources(filter: { projectId: string; studyId?: string }): Promise<ResearchSourceSummary[]>;
  getSource(id: string): Promise<ResearchSource | null>;
  createSource(input: CreateSourceInput): Promise<ResearchSourceSummary>;
  updateSourceMetadata(id: string, input: SourceMetadataInput): Promise<ResearchSourceSummary>;
  deleteSource(id: string): Promise<void>;
  /** A short-lived link to download the original uploaded file. */
  sourceDownloadUrl(storagePath: string): Promise<string>;

  search(workspaceId: string, term: string): Promise<SearchResults>;
}
