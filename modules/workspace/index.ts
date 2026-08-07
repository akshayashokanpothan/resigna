// modules/workspace/index.ts — Public API
export type { Workspace, WorkspaceMember } from './types/workspace.types';
export type { WorkspaceRepository } from './repositories/workspace.repository';
export { workspaceService } from './services/workspace.service';
export { useWorkspaces, useFirstWorkspace } from './hooks/use-workspace';
export { deriveWorkspaceName, generateWorkspaceSlug } from './domain/workspace.domain';
