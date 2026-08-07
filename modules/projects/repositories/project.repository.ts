import type { Project, CreateProjectInput } from '../types/project.types';

/**
 * Project repository interface.
 * Application layer depends on this — never on Supabase directly.
 */
export interface ProjectRepository {
  findAll(workspaceId: string): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  create(input: CreateProjectInput): Promise<Project>;
  update(
    id: string,
    input: Partial<Pick<Project, 'name' | 'description' | 'status'>>,
  ): Promise<Project>;
  delete(id: string): Promise<void>;
}
