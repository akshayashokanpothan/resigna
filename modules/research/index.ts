// modules/research/index.ts — Public API
export type {
  Study,
  Participant,
  ResearchSource,
  ResearchSourceSummary,
  ConsentStatus,
  SourceType,
  StudyMethod,
  StudyStatus,
} from './types/research.types';
export type { ResearchRepository } from './repositories/research.repository';
export { researchService } from './services/research.service';
export {
  useProjectResearchCounts,
  useStudies,
  useStudy,
  useParticipants,
  useSources,
  useSource,
  useResearchSearch,
} from './hooks/use-research';
export { ProjectResearch } from './components/ProjectResearch';
export { StudyDetail } from './components/StudyDetail';
export { SourceDetail } from './components/SourceDetail';
export { ResearchSearch } from './components/ResearchSearch';
