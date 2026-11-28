'use client';

import { use, useState } from 'react';
import { Archive, ArchiveRestore, Pencil } from 'lucide-react';
import { EditProjectDialog, useProject, useProjectActions } from '@/modules/projects';
import { Button } from '@/shared/components/Button';
import { PageHeader } from '@/shared/components/PageHeader';
import { Skeleton } from '@/shared/components/Skeleton';
import { NetworkError, NotFound } from '@/shared/components/ErrorPage';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);

  return <ProjectDetailContent projectId={id} />;
}

function ProjectDetailContent({ projectId }: { projectId: string }) {
  const { data: project, isLoading, isError, refetch } = useProject(projectId);
  const { setArchived, isPending } = useProjectActions(project);
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
    );
  }

  if (isError) {
    return <NetworkError onRetry={() => refetch()} />;
  }

  if (!project) {
    return <NotFound resource="Project" />;
  }

  const isArchived = project.status === 'archived';

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader
        title={project.name}
        description={project.description ?? undefined}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsEditing(true)} disabled={isPending}>
              <Pencil size={14} aria-hidden="true" />
              Edit
            </Button>
            <Button
              variant="secondary"
              onClick={() => setArchived(!isArchived)}
              disabled={isPending}
            >
              {isArchived ? (
                <ArchiveRestore size={14} aria-hidden="true" />
              ) : (
                <Archive size={14} aria-hidden="true" />
              )}
              {isArchived ? 'Restore' : 'Archive'}
            </Button>
          </div>
        }
      />

      {isArchived && (
        <p
          role="status"
          className="mb-4 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]"
        >
          This project is archived. Restore it to keep working on it.
        </p>
      )}

      <div className="rounded-lg border border-[hsl(var(--border))] border-dashed p-12 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Research workspace — coming in Sprint 1
        </p>
      </div>

      <EditProjectDialog project={project} open={isEditing} onClose={() => setIsEditing(false)} />
    </div>
  );
}
