'use client';

import { useFirstWorkspace } from '@/modules/workspace';
import {
  CreateProjectDialog,
  NewProjectButton,
  ProjectList,
  ProjectListSkeleton,
} from '@/modules/projects';
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

  return (
    <div className="mx-auto max-w-3xl p-6">
      <PageHeader
        title="Projects"
        description="Your research projects live here."
        action={<NewProjectButton disabled={!workspace} />}
      />

      <div className="rounded-lg border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--card))]">
        {isWorkspaceLoading ? (
          <ProjectListSkeleton count={5} />
        ) : isWorkspaceError ? (
          <NetworkError onRetry={() => refetchWorkspace()} />
        ) : workspace ? (
          <ProjectList workspaceId={workspace.id} />
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
