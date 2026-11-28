'use client';

import { FolderOpen } from 'lucide-react';
import { useProjects } from '../hooks/use-projects';
import { partitionProjectsByStatus } from '../domain/project.domain';
import type { Project } from '../types/project.types';
import { ProjectCard } from './ProjectCard';
import { ProjectListSkeleton } from './ProjectListSkeleton';
import { NewProjectButton } from './NewProjectButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { NetworkError } from '@/shared/components/ErrorPage';

interface ProjectListProps {
  workspaceId: string;
}

export function ProjectList({ workspaceId }: ProjectListProps) {
  const { data: projects, isLoading, isError, refetch } = useProjects(workspaceId);

  if (isLoading) return <ProjectListSkeleton count={5} />;

  if (isError) return <NetworkError onRetry={() => refetch()} />;

  const { active, archived } = partitionProjectsByStatus(projects ?? []);

  if (active.length === 0 && archived.length === 0) {
    return (
      <EmptyState
        illustration="no-projects"
        title="No projects yet"
        description="A project brings the research for one study together: sources, evidence and the insights you draw from them."
        action={<NewProjectButton label="Create your first project" />}
      />
    );
  }

  return (
    <>
      {active.length > 0 ? (
        <ProjectGroup label="Projects" projects={active} />
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No active projects"
          description="All your projects are archived. Create a new one or restore an archived project."
          action={<NewProjectButton />}
        />
      )}
      {archived.length > 0 && (
        <section aria-labelledby="archived-projects-heading">
          <h2
            id="archived-projects-heading"
            className="border-y border-border bg-canvas px-4 py-2 type-overline text-fg-secondary"
          >
            Archived
          </h2>
          <ProjectGroup label="Archived projects" projects={archived} />
        </section>
      )}
    </>
  );
}

function ProjectGroup({ label, projects }: { label: string; projects: Project[] }) {
  return (
    <div role="list" aria-label={label}>
      {projects.map((project) => (
        <div key={project.id} role="listitem">
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  );
}
