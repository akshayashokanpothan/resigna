import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../services/projects.service';
import type { UpdateProjectInput } from '../types/project.types';
import { queryKeys } from '@/shared/constants/query-keys';
import { toast } from '@/shared/utils/toast';

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsService.create,
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(project.workspaceId) });
      queryClient.setQueryData(queryKeys.projects.detail(project.id), project);
      toast.success('Project created');
    },
    onError: (error) => {
      toast.error('Could not create the project. Please try again.', error);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      projectsService.update(id, input),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(project.id), project);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(project.workspaceId) });
    },
    onError: (error) => {
      toast.error('Could not save the project. Please try again.', error);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsService.delete,
    onSuccess: () => {
      // The deleted project's workspace isn't known here, so refresh every project query.
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.root() });
      toast.success('Project deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete project', error);
    },
  });
}
