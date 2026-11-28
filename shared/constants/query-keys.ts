/**
 * TanStack Query key factory.
 * Centralizes all query keys for consistent cache invalidation.
 */
export const queryKeys = {
  auth: {
    session: () => ['auth', 'session'] as const,
    user: () => ['auth', 'user'] as const,
  },
  workspaces: {
    all: () => ['workspaces'] as const,
    detail: (id: string) => ['workspaces', id] as const,
  },
  projects: {
    root: () => ['projects'] as const,
    all: (workspaceId: string) => ['projects', workspaceId] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
  },
  research: {
    /** Everything research-related for one project; invalidate this after any write. */
    project: (projectId: string) => ['research', projectId] as const,
    counts: (projectId: string) => ['research', projectId, 'counts'] as const,
    studies: (projectId: string) => ['research', projectId, 'studies'] as const,
    study: (projectId: string, studyId: string) =>
      ['research', projectId, 'study', studyId] as const,
    participants: (projectId: string) => ['research', projectId, 'participants'] as const,
    sources: (projectId: string, studyId?: string) =>
      ['research', projectId, 'sources', studyId ?? 'all'] as const,
    source: (projectId: string, sourceId: string) =>
      ['research', projectId, 'source', sourceId] as const,
    search: (workspaceId: string, term: string) => ['research-search', workspaceId, term] as const,
  },
} as const;
