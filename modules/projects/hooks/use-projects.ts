'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/query-keys';
import { projectsService } from '../services/projects.service';

export function useProjects(workspaceId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.all(workspaceId ?? ''),
    queryFn: () => projectsService.getAll(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId ?? ''),
    queryFn: () => projectsService.getById(projectId!),
    enabled: !!projectId,
  });
}
