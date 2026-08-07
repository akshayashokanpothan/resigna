import type { Workspace } from '../types/workspace.types';

export interface CreateWorkspaceInput {
  name: string;
  slug: string;
  ownerId: string;
}

/**
 * Workspace repository interface.
 * Application layer depends on this — never on Supabase directly.
 */
export interface WorkspaceRepository {
  findByOwnerId(ownerId: string): Promise<Workspace[]>;
  findById(id: string): Promise<Workspace | null>;
  create(input: CreateWorkspaceInput): Promise<Workspace>;
  slugExists(slug: string): Promise<boolean>;
}
