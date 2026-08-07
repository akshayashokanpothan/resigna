'use client';

import { primaryNavItems } from '@/config/navigation';
import { SidebarNavItem } from './SidebarNavItem';

export function SidebarNav() {
  return (
    <nav aria-label="Primary navigation">
      <ul role="list" className="flex flex-col gap-0.5">
        {primaryNavItems.map((item) => (
          <li key={item.id}>
            <SidebarNavItem item={item} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
