'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/config/navigation';
import { cn } from '@/shared/utils/cn';
import { useSidebarStore } from '@/stores/sidebar.store';

interface SidebarNavItemProps {
  item: NavItem;
}

export function SidebarNavItem({ item }: SidebarNavItemProps) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebarStore();
  const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);

  const content = (
    <span
      className={cn(
        'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors w-full',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[hsl(var(--primary))]',
        isActive
          ? 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] font-medium'
          : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
        item.disabled &&
          'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-[hsl(var(--muted-foreground))]',
      )}
    >
      <item.icon size={16} className="shrink-0" aria-hidden="true" />
      {!isCollapsed && <span className="truncate">{item.label}</span>}
    </span>
  );

  if (item.disabled) {
    return (
      <div
        title={isCollapsed ? `${item.label} — ${item.disabledReason}` : item.disabledReason}
        aria-disabled="true"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      title={isCollapsed ? item.label : undefined}
      aria-current={isActive ? 'page' : undefined}
    >
      {content}
    </Link>
  );
}
