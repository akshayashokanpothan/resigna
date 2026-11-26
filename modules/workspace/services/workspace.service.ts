import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { SupabaseWorkspaceRepository } from '../repositories/supabase-workspace.repository';
import type { WorkspaceRepository } from '../repositories/workspace.repository';
import type { Workspace } from '../types/workspace.types';

function createWorkspaceRepository(): WorkspaceRepository {
  return new SupabaseWorkspaceRepository(createBrowserSupabaseClient());
}

let _repo: WorkspaceRepository | null = null;
function getRepo(): WorkspaceRepository {
  if (!_repo) _repo = createWorkspaceRepository();
  return _repo;
}

export const workspaceService = {
  async getWorkspacesForUser(userId: string): Promise<Workspace[]> {
    return getRepo().findByOwnerId(userId);
  },

  async getById(id: string): Promise<Workspace | null> {
    return getRepo().findById(id);
  },
};
