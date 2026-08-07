'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';

const routeLabels: Record<string, string> = {
  projects: 'Projects',
  settings: 'Settings',
  knowledge: 'Knowledge',
  deliverables: 'Deliverables',
};

export function Breadcrumbs() {
  const pathname = usePathname();

  if (pathname === ROUTES.home || pathname === ROUTES.projects) {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1" role="list">
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const label = routeLabels[segment] ?? segment;
          const isLast = index === segments.length - 1;

          return (
            <li key={href} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  size={12}
                  className="text-[hsl(var(--muted-foreground))]"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="text-sm font-medium text-[hsl(var(--foreground))]"
                >
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
