'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/stores/sidebar.store';
import { partitionProjectsByStatus, usePrefetchProject, useProjects } from '@/modules/projects';
import { usePrefetchProjectResearch } from '@/modules/research';
import { useFirstWorkspace } from '@/modules/workspace';
import { cn } from '@/shared/utils/cn';
import { ROUTES } from '@/shared/constants/routes';

export function SidebarRecentProjects() {
  const { isCollapsed } = useSidebarStore();
  const { workspace } = useFirstWorkspace();
  const { data: projects } = useProjects(workspace?.id);
  const pathname = usePathname();
  const prefetchProject = usePrefetchProject();
  const prefetchResearch = usePrefetchProjectResearch();
  const prefetch = (projectId: string) => {
    prefetchProject(projectId);
    prefetchResearch(projectId);
  };

  const recentProjects = partitionProjectsByStatus(projects ?? []).active.slice(0, 5);

  if (isCollapsed || recentProjects.length === 0) {
    return null;
  }

  return (
    <nav className="mt-5" aria-labelledby="recent-projects-heading">
      <h3 id="recent-projects-heading" className="px-2.5 pb-1 type-overline text-fg-secondary">
        Recent projects
      </h3>
      <ul className="flex flex-col gap-0.5" role="list">
        {recentProjects.map((project) => {
          const href = ROUTES.project(project.id);
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={project.id}>
              <Link
                href={href}
                onPointerEnter={() => prefetch(project.id)}
                onFocus={() => prefetch(project.id)}
                className={cn(
                  'flex h-8 items-center gap-2.5 rounded-control px-2.5 text-sm focus-ring',
                  'transition-colors duration-fast ease-standard',
                  isActive
                    ? 'bg-layer-selected font-medium text-fg'
                    : 'text-fg-secondary hover:bg-layer-hover hover:text-fg',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-1.5 shrink-0 rounded-full',
                    isActive ? 'bg-accent' : 'bg-border-strong',
                  )}
                />
                <span className="truncate">{project.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
