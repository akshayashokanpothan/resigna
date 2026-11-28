'use client';

import { Dialog } from '@/shared/components/Dialog';
import { useProjectActions } from '../hooks/use-project-actions';
import type { Project } from '../types/project.types';
import { ProjectForm } from './ProjectForm';

interface EditProjectDialogProps {
  project: Project;
  open: boolean;
  onClose: () => void;
}

export function EditProjectDialog({ project, open, onClose }: EditProjectDialogProps) {
  const { save, isPending } = useProjectActions(project);

  return (
    <Dialog open={open} onClose={onClose} title="Edit project">
      <ProjectForm
        defaultValues={{ name: project.name, description: project.description ?? '' }}
        submitLabel="Save changes"
        pendingLabel="Saving…"
        isPending={isPending}
        onCancel={onClose}
        onSubmit={async (values) => {
          const saved = await save(values);
          if (saved) onClose();
          return saved;
        }}
      />
    </Dialog>
  );
}
