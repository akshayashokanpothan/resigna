import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { SupabaseProjectRepository } from '../repositories/supabase-project.repository';
import type { ProjectRepository } from '../repositories/project.repository';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../types/project.types';

let _repo: ProjectRepository | null = null;
function getRepo(): ProjectRepository {
  if (!_repo) _repo = new SupabaseProjectRepository(createBrowserSupabaseClient());
  return _repo;
}

export const projectsService = {
  getAll: (workspaceId: string): Promise<Project[]> => getRepo().findAll(workspaceId),
  getById: (id: string): Promise<Project | null> => getRepo().findById(id),
  create: (input: CreateProjectInput): Promise<Project> => getRepo().create(input),
  update: (id: string, input: UpdateProjectInput): Promise<Project> => getRepo().update(id, input),
  delete: (id: string): Promise<void> => getRepo().delete(id),
};
