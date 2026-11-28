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
    <div className="mt-4 px-2">
      <h3 className="px-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
        Recent Projects
      </h3>
      <ul className="mt-1 flex flex-col gap-0.5" role="list">
        {recentProjects.map((project) => {
          const href = ROUTES.project(project.id);
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={project.id}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] font-medium'
                    : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[hsl(var(--primary))]',
                )}
              >
                <span className="truncate">{project.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
