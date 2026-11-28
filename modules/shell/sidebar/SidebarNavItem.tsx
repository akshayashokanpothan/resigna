'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/config/navigation';
import { cn } from '@/shared/utils/cn';
import { useSidebarStore } from '@/stores/sidebar.store';
import { Tooltip } from '@/shared/components/Tooltip';

interface SidebarNavItemProps {
  item: NavItem;
}

const rowClass = cn(
  'group relative flex h-8 w-full items-center gap-2.5 rounded-control px-2.5 text-sm',
  'transition-colors duration-fast ease-standard',
);

export function SidebarNavItem({ item }: SidebarNavItemProps) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebarStore();
  const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);

  if (item.disabled) {
    const reason = item.description ? `${item.description}. Coming soon.` : 'Coming soon.';
    return (
      <Tooltip
        content={isCollapsed ? `${item.label} — coming soon` : reason}
        side="right"
        triggerClassName="flex w-full"
      >
        <span
          aria-disabled="true"
          className={cn(
            rowClass,
            'cursor-not-allowed text-fg-muted',
            isCollapsed && 'justify-center px-0',
          )}
        >
          <item.icon size={16} className="shrink-0" aria-hidden="true" />
          {isCollapsed ? (
            <span className="sr-only">{item.label} (coming soon)</span>
          ) : (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              <span className="rounded-pill border border-border px-1.5 text-2xs leading-4 text-fg-secondary">
                Soon
              </span>
            </>
          )}
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip
      content={item.label}
      side="right"
      disabled={!isCollapsed}
      describesTrigger={false}
      triggerClassName="flex w-full"
    >
      <Link
        href={item.href}
        aria-current={isActive ? 'page' : undefined}
        aria-label={isCollapsed ? item.label : undefined}
        className={cn(
          rowClass,
          'focus-ring',
          isCollapsed && 'justify-center px-0',
          isActive
            ? 'bg-layer-selected font-medium text-fg'
            : 'text-fg-secondary hover:bg-layer-hover hover:text-fg',
        )}
      >
        {isActive && (
          <span
            aria-hidden="true"
            className="absolute -left-2 top-1.5 bottom-1.5 w-[3px] rounded-r-xs bg-accent"
          />
        )}
        <item.icon
          size={16}
          className={cn('shrink-0', isActive ? 'text-accent-text' : 'text-current')}
          aria-hidden="true"
        />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </Link>
    </Tooltip>
  );
}
