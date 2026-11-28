'use client';

import { useFirstWorkspace } from '@/modules/workspace';
import {
  CreateProjectDialog,
  NewProjectButton,
  ProjectList,
  ProjectListSkeleton,
} from '@/modules/projects';
import { usePrefetchProjectResearch } from '@/modules/research';
import { EmptyState } from '@/shared/components/EmptyState';
import { NetworkError } from '@/shared/components/ErrorPage';
import { PageHeader } from '@/shared/components/PageHeader';

export default function ProjectsPage() {
  const {
    workspace,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
    refetch: refetchWorkspace,
  } = useFirstWorkspace();
  const prefetchResearch = usePrefetchProjectResearch();

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <PageHeader
        title="Projects"
        description="Each project holds the research for one study: its sources, evidence and insights."
        action={<NewProjectButton disabled={!workspace} />}
      />

      <div className="overflow-hidden rounded-card border border-border bg-surface">
        {isWorkspaceLoading ? (
          <ProjectListSkeleton count={5} />
        ) : isWorkspaceError ? (
          <NetworkError onRetry={() => refetchWorkspace()} />
        ) : workspace ? (
          <ProjectList
            workspaceId={workspace.id}
            onProjectIntent={(project) => prefetchResearch(project.id)}
          />
        ) : (
          <EmptyState
            title="No workspace found"
            description="Your account doesn't have a workspace yet. Try signing out and back in."
          />
        )}
      </div>

      <CreateProjectDialog workspaceId={workspace?.id} />
    </div>
  );
}
