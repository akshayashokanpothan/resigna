import { queryOptions } from '@tanstack/react-query';
import { projectsService } from '../services/projects.service';
import { queryKeys } from '@/shared/constants/query-keys';

export const projectsQueries = {
  all: (workspaceId: string) =>
    queryOptions({
      queryKey: queryKeys.projects.all(workspaceId),
      queryFn: () => projectsService.getAll(workspaceId),
    }),
  detail: (projectId: string) =>
    queryOptions({
      queryKey: queryKeys.projects.detail(projectId),
      queryFn: () => projectsService.getById(projectId),
    }),
};
