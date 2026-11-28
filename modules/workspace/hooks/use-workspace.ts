'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/query-keys';
import { workspaceService } from '../services/workspace.service';
import { useCurrentUser } from '@/modules/auth';

export function useWorkspaces() {
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: queryKeys.workspaces.all(),
    queryFn: () => workspaceService.getWorkspacesForUser(user!.id),
    enabled: !!user,
    // Workspaces almost never change, and every project list waits for this one.
    staleTime: 30 * 60 * 1000,
  });
}

export function useFirstWorkspace() {
  const { data: workspaces, ...rest } = useWorkspaces();
  return { workspace: workspaces?.[0] ?? null, ...rest };
}
