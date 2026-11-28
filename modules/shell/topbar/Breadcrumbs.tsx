'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useProject } from '@/modules/projects';
import { useSource, useStudy } from '@/modules/research';
import { ROUTES } from '@/shared/constants/routes';

const routeLabels: Record<string, string> = {
  projects: 'Projects',
  settings: 'Settings',
  research: 'Research',
  knowledge: 'Knowledge',
  'design-system': 'Design system',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  // On /projects/[id]/…, show the project's name instead of its id.
  const projectId = segments[0] === 'projects' ? segments[1] : undefined;
  const { data: project } = useProject(projectId);
  // /projects/[id]/studies/[studyId] and /projects/[id]/sources/[sourceId]
  const child = projectId ? segments[2] : undefined;
  const childId = segments[3];
  const { data: study } = useStudy(projectId ?? '', child === 'studies' ? childId : undefined);
  const { data: source } = useSource(projectId ?? '', child === 'sources' ? childId : undefined);
  const { data: sourceStudy } = useStudy(projectId ?? '', source?.studyId);

  if (pathname === ROUTES.home || pathname === ROUTES.projects) {
    return null;
  }

  const crumbs: { href: string; label: string }[] = [];
  if (projectId && (child === 'studies' || child === 'sources') && childId) {
    crumbs.push({ href: ROUTES.projects, label: 'Projects' });
    crumbs.push({ href: ROUTES.project(projectId), label: project?.name ?? 'Project' });
    if (child === 'studies') {
      crumbs.push({ href: pathname, label: study?.title ?? 'Study' });
    } else {
      if (sourceStudy) {
        crumbs.push({ href: ROUTES.study(projectId, sourceStudy.id), label: sourceStudy.title });
      }
      crumbs.push({ href: pathname, label: source?.title ?? 'Source' });
    }
  } else {
    segments.forEach((segment, index) => {
      crumbs.push({
        href: `/${segments.slice(0, index + 1).join('/')}`,
        label:
          index === 1 && segment === projectId
            ? (project?.name ?? 'Project')
            : (routeLabels[segment] ?? segment),
      });
    });
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex min-w-0 items-center gap-1" role="list">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={`${crumb.href}-${index}`} className="flex min-w-0 items-center gap-1">
              {index > 0 && (
                <ChevronRight size={12} className="shrink-0 text-fg-secondary" aria-hidden="true" />
              )}
              {isLast ? (
                <span aria-current="page" className="truncate text-sm font-medium text-fg">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="truncate text-sm text-fg-secondary hover:text-fg transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
