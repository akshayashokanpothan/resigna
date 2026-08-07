import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { logger } from '@/shared/logger';
import { deriveWorkspaceName, generateWorkspaceSlug } from '../domain/workspace.domain';
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

  /**
   * Creates a default workspace for a new user.
   * Called automatically after successful signup.
   */
  async createDefaultWorkspace(userId: string, nameOrEmail: string): Promise<Workspace> {
    const repo = getRepo();
    const baseName = deriveWorkspaceName(nameOrEmail);
    let slug = generateWorkspaceSlug(baseName);

    // Ensure slug uniqueness with suffix
    const exists = await repo.slugExists(slug);
    if (exists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const workspace = await repo.create({ name: baseName, slug, ownerId: userId });
    logger.info('Default workspace created', { workspaceId: workspace.id, userId });
    return workspace;
  },
};
