import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../services/projects.service';
import { queryKeys } from '@/shared/constants/query-keys';
import { toast } from '@/shared/utils/toast';

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsService.create,
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(project.workspaceId) });
      toast.success('Project created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create project', error);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all('') }); // Hacky but works for now to invalidate all projects since we don't have workspaceId here
      toast.success('Project deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete project', error);
    },
  });
}
