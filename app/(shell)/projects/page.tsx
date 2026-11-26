'use client';

import { useFirstWorkspace } from '@/modules/workspace';
import { ProjectList, ProjectListSkeleton } from '@/modules/projects';
import { EmptyState } from '@/shared/components/EmptyState';
import { NetworkError } from '@/shared/components/ErrorPage';

export default function ProjectsPage() {
  const {
    workspace,
    isLoading: isWorkspaceLoading,
    isError: isWorkspaceError,
    refetch: refetchWorkspace,
  } = useFirstWorkspace();

  return (
    <div className="mx-auto max-w-3xl p-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-base font-semibold text-[hsl(var(--foreground))]">Projects</h1>
        <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
          Your research projects live here.
        </p>
      </div>

      {/* Content */}
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
    </div>
  );
}
