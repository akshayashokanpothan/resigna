import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../services/projects.service';
import type { Project, UpdateProjectInput } from '../types/project.types';
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
    // Optimistic: show the new name, description or archived state at once instead of after a
    // round trip to the database, and roll back if the write fails.
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.root() });
      const snapshot = queryClient.getQueriesData<Project[] | Project | null>({
        queryKey: queryKeys.projects.root(),
      });
      queryClient.setQueriesData<Project[] | Project | null>(
        { queryKey: queryKeys.projects.root() },
        (data) => {
          if (Array.isArray(data)) {
            return data.map((project) => (project.id === id ? { ...project, ...input } : project));
          }
          return data && data.id === id ? { ...data, ...input } : data;
        },
      );
      return { snapshot };
    },
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(project.id), project);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(project.workspaceId) });
    },
    onError: (error, _vars, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
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
