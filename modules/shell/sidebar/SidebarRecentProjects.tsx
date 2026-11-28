'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/stores/sidebar.store';
import { partitionProjectsByStatus, useProjects } from '@/modules/projects';
import { useFirstWorkspace } from '@/modules/workspace';
import { cn } from '@/shared/utils/cn';
import { ROUTES } from '@/shared/constants/routes';

export function SidebarRecentProjects() {
  const { isCollapsed } = useSidebarStore();
  const { workspace } = useFirstWorkspace();
  const { data: projects } = useProjects(workspace?.id);
  const pathname = usePathname();

  const recentProjects = partitionProjectsByStatus(projects ?? []).active.slice(0, 5);

  if (isCollapsed || recentProjects.length === 0) {
    return null;
  }

  return (
    <div className="mt-5">
      <h3 id="recent-projects-heading" className="px-2.5 pb-1 type-overline text-fg-secondary">
        Recent projects
      </h3>
      <ul className="flex flex-col gap-0.5" role="list" aria-labelledby="recent-projects-heading">
        {recentProjects.map((project) => {
          const href = ROUTES.project(project.id);
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={project.id}>
              <Link
                href={href}
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
    </div>
  );
}
