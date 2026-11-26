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
} as const;
