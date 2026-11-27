'use client';

import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/modules/auth';
import { ROUTES } from '@/shared/constants/routes';
import { toast } from '@/shared/utils/toast';
import { useCreateProject, useUpdateProject } from '../mutations/projects.mutations';
import { normalizeDescription } from '../domain/project.domain';
import type { ProjectFormValues } from '../schemas/project.schema';
import type { Project } from '../types/project.types';

/** Creates a project in the given workspace, then opens it. */
export function useCreateProjectFlow(workspaceId: string | undefined) {
  const router = useRouter();
  const { user } = useCurrentUser();
  const mutation = useCreateProject();

  const submit = async (values: ProjectFormValues): Promise<boolean> => {
    if (!workspaceId || !user) {
      toast.error('Your session is still loading. Please try again in a moment.');
      return false;
    }
    try {
      const project = await mutation.mutateAsync({
        workspaceId,
        createdBy: user.id,
        name: values.name,
        description: normalizeDescription(values.description),
      });
      router.push(ROUTES.project(project.id));
      return true;
    } catch {
      return false;
    }
  };

  return { submit, isPending: mutation.isPending };
}

/** Rename, edit the description of, archive or restore one project. */
export function useProjectActions(project: Project | null | undefined) {
  const mutation = useUpdateProject();

  const save = async (values: ProjectFormValues): Promise<boolean> => {
    if (!project) return false;
    try {
      await mutation.mutateAsync({
        id: project.id,
        input: { name: values.name, description: normalizeDescription(values.description) },
      });
      toast.success('Project updated');
      return true;
    } catch {
      return false;
    }
  };

  const setArchived = async (archived: boolean): Promise<boolean> => {
    if (!project) return false;
    try {
      await mutation.mutateAsync({
        id: project.id,
        input: { status: archived ? 'archived' : 'active' },
      });
      toast.success(archived ? 'Project archived' : 'Project restored');
      return true;
    } catch {
      return false;
    }
  };

  return { save, setArchived, isPending: mutation.isPending };
}
