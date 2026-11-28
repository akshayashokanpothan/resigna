'use client';

import { bottomNavItems } from '@/config/navigation';
import { SidebarNavItem } from './SidebarNavItem';

export function SidebarFooter() {
  return (
    <div className="flex flex-col gap-0.5 border-t border-border pt-2">
      <ul role="list" className="flex flex-col gap-0.5">
        {bottomNavItems.map((item) => (
          <li key={item.id}>
            <SidebarNavItem item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}
