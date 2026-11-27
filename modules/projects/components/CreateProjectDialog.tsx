'use client';

import { useEffect } from 'react';
import { Dialog } from '@/shared/components/Dialog';
import { useProjectDialogStore } from '@/stores/project-dialog.store';
import { useCreateProjectFlow } from '../hooks/use-project-actions';
import { ProjectForm } from './ProjectForm';

interface CreateProjectDialogProps {
  workspaceId: string | undefined;
}

export function CreateProjectDialog({ workspaceId }: CreateProjectDialogProps) {
  const { isCreateOpen, closeCreate } = useProjectDialogStore();
  const { submit, isPending } = useCreateProjectFlow(workspaceId);

  // Don't leave the dialog open for the next visit if the user navigates away.
  useEffect(() => closeCreate, [closeCreate]);

  return (
    <Dialog
      open={isCreateOpen}
      onClose={closeCreate}
      title="New project"
      description="A project holds the research, evidence and deliverables for one study."
    >
      <ProjectForm
        submitLabel="Create project"
        pendingLabel="Creating…"
        isPending={isPending}
        onCancel={closeCreate}
        onSubmit={async (values) => {
          const created = await submit(values);
          if (created) closeCreate();
          return created;
        }}
      />
    </Dialog>
  );
}
