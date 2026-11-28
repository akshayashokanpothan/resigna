'use client';

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/query-keys';
import { projectsService } from '../services/projects.service';
import type { Project } from '../types/project.types';

export function useProjects(workspaceId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.all(workspaceId ?? ''),
    queryFn: () => projectsService.getAll(workspaceId!),
    enabled: !!workspaceId,
  });
}

/** A project from any project list already in the cache, so its page can render at once. */
function findCachedProject(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string | undefined,
): Project | undefined {
  if (!projectId) return undefined;
  for (const [, data] of queryClient.getQueriesData<Project[] | Project | null>({
    queryKey: queryKeys.projects.root(),
  })) {
    if (Array.isArray(data)) {
      const match = data.find((project) => project.id === projectId);
      if (match) return match;
    }
  }
  return undefined;
}

export function useProject(projectId: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId ?? ''),
    queryFn: () => projectsService.getById(projectId!),
    enabled: !!projectId,
    // Render the row from the project list straight away; the full record refreshes behind it.
    placeholderData: () => findCachedProject(queryClient, projectId),
  });
}

/** Warms one project's record before navigation (on hover, focus or touch of its link). */
export function usePrefetchProject() {
  const queryClient = useQueryClient();
  return useCallback(
    (projectId: string) => {
      void queryClient.prefetchQuery({
        queryKey: queryKeys.projects.detail(projectId),
        queryFn: () => projectsService.getById(projectId),
      });
    },
    [queryClient],
  );
}
