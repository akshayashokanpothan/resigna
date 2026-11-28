'use client';

import { Suspense, useEffect, useState } from 'react';
import { Archive, ArchiveRestore, Pencil } from 'lucide-react';
import { EditProjectDialog, useProject, useProjectActions } from '@/modules/projects';
import { ProjectResearch, usePrefetchProjectResearch } from '@/modules/research';
import Link from 'next/link';
import { Badge } from '@/shared/components/Badge';
import { Button, buttonVariants } from '@/shared/components/Button';
import { Notification } from '@/shared/components/Notification';
import { ROUTES } from '@/shared/constants/routes';
import { PageHeader } from '@/shared/components/PageHeader';
import { Skeleton } from '@/shared/components/Skeleton';
import { NetworkError, NotFound } from '@/shared/components/ErrorPage';

/** Client view for /projects/[id]; the page file stays a Server Component so the route can be static. */
export function ProjectDetailView({ projectId }: { projectId: string }) {
  const { data: project, isLoading, isError, refetch } = useProject(projectId);
  const prefetchResearch = usePrefetchProjectResearch();

  // Start the studies, sources and participants requests now, in parallel with the project
  // request, instead of waiting for the project to load before the research tab asks for them.
  useEffect(() => {
    prefetchResearch(projectId);
  }, [prefetchResearch, projectId]);
  const { setArchived, isPending } = useProjectActions(project);
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-8 py-8" role="status" aria-live="polite">
        <span className="sr-only">Loading project</span>
        <Skeleton className="mb-3 h-7 w-64" />
        <Skeleton className="mb-8 h-4 w-96" />
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    );
  }

  if (isError) {
    return <NetworkError onRetry={() => refetch()} />;
  }

  if (!project) {
    return (
      <NotFound
        resource="Project"
        action={
          <Link href={ROUTES.projects} className={buttonVariants({ variant: 'secondary' })}>
            Back to projects
          </Link>
        }
      />
    );
  }

  const isArchived = project.status === 'archived';

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <PageHeader
        title={project.name}
        eyebrow="Project"
        description={project.description ?? undefined}
        meta={isArchived ? <Badge>Archived</Badge> : undefined}
        action={
          <>
            <Button
              variant="secondary"
              leadingIcon={Pencil}
              onClick={() => setIsEditing(true)}
              disabled={isPending}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              leadingIcon={isArchived ? ArchiveRestore : Archive}
              onClick={() => setArchived(!isArchived)}
              disabled={isPending}
            >
              {isArchived ? 'Restore' : 'Archive'}
            </Button>
          </>
        }
      />

      {isArchived && (
        <Notification tone="info" title="This project is archived" className="mb-6">
          It is read-only and hidden from your active projects. Restore it to keep working on it.
        </Notification>
      )}

      <Suspense>
        <ProjectResearch projectId={project.id} readOnly={isArchived} />
      </Suspense>

      <EditProjectDialog project={project} open={isEditing} onClose={() => setIsEditing(false)} />
    </div>
  );
}
