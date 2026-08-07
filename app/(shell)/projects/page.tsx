'use client';

import { useFirstWorkspace } from '@/modules/workspace/hooks/use-workspace';
import { ProjectList } from '@/modules/projects/components/ProjectList';
import { ProjectListSkeleton } from '@/modules/projects/components/ProjectListSkeleton';

export default function ProjectsPage() {
  const { workspace, isLoading: isWorkspaceLoading } = useFirstWorkspace();

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
        ) : workspace ? (
          <ProjectList workspaceId={workspace.id} />
        ) : null}
      </div>
    </div>
  );
}
