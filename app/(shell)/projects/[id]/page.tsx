'use client';

import { use } from 'react';
import { useProject } from '@/modules/projects';
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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-base font-semibold text-[hsl(var(--foreground))]">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{project.description}</p>
        )}
      </div>

      <div className="rounded-lg border border-[hsl(var(--border))] border-dashed p-12 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Research workspace — coming in Sprint 1
        </p>
      </div>
    </div>
  );
}
