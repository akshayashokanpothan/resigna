'use client';

import { useProjects } from '../hooks/use-projects';
import { ProjectCard } from './ProjectCard';
import { ProjectListSkeleton } from './ProjectListSkeleton';
import { EmptyState } from '@/shared/components/EmptyState';
import { NetworkError } from '@/shared/components/ErrorPage';
import { FolderOpen } from 'lucide-react';

interface ProjectListProps {
  workspaceId: string;
}

export function ProjectList({ workspaceId }: ProjectListProps) {
  const { data: projects, isLoading, isError, refetch } = useProjects(workspaceId);

  if (isLoading) return <ProjectListSkeleton count={5} />;

  if (isError) return <NetworkError onRetry={() => refetch()} />;

  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No projects yet"
        description="Projects will appear here once you create your first one."
      />
    );
  }

  return (
    <div role="list" aria-label="Projects">
      {projects.map((project) => (
        <div key={project.id} role="listitem">
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  );
}
