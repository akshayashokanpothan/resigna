// modules/projects/index.ts — Public API
export type { Project, CreateProjectInput } from './types/project.types';
export type { ProjectRepository } from './repositories/project.repository';
export { projectsService } from './services/projects.service';
export { useProjects, useProject } from './hooks/use-projects';
export { ProjectCard } from './components/ProjectCard';
export { ProjectListSkeleton } from './components/ProjectListSkeleton';
