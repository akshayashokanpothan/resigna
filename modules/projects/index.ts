// modules/projects/index.ts — Public API
export type { Project, CreateProjectInput, UpdateProjectInput } from './types/project.types';
export type { ProjectFormValues } from './schemas/project.schema';
export type { ProjectRepository } from './repositories/project.repository';
export { projectsService } from './services/projects.service';
export { useProjects, useProject, usePrefetchProject } from './hooks/use-projects';
export { partitionProjectsByStatus } from './domain/project.domain';
export { useCreateProjectFlow, useProjectActions } from './hooks/use-project-actions';
export { ProjectCard } from './components/ProjectCard';
export { ProjectList } from './components/ProjectList';
export { ProjectListSkeleton } from './components/ProjectListSkeleton';
export { CreateProjectDialog } from './components/CreateProjectDialog';
export { EditProjectDialog } from './components/EditProjectDialog';
export { NewProjectButton } from './components/NewProjectButton';
