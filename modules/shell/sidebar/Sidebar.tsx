'use client';

import { motion } from 'framer-motion';
import { PanelLeft } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar.store';
import { SidebarNav } from './SidebarNav';
import { SidebarRecentProjects } from './SidebarRecentProjects';
import { SidebarFooter } from './SidebarFooter';
import { cn } from '@/shared/utils/cn';
import { APP_NAME } from '@/shared/constants/app.constants';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/shared/constants/app.constants';

export function Sidebar() {
  const { isCollapsed, toggle, width } = useSidebarStore();

  return (
    <motion.aside
      animate={{ width }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'relative flex h-full shrink-0 flex-col',
        'border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]',
        'overflow-hidden',
      )}
      style={{ minWidth: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      aria-label="Application sidebar"
    >
      {/* Logo + Collapse button */}
      <div className="flex h-12 items-center justify-between px-3 border-b border-[hsl(var(--border))]">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="text-sm font-semibold tracking-tight text-[hsl(var(--foreground))]"
          >
            {APP_NAME}
          </motion.span>
        )}

        <button
          onClick={toggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'rounded-md p-1.5 text-[hsl(var(--muted-foreground))] transition-colors',
            'hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1',
            'focus-visible:outline-[hsl(var(--primary))]',
            isCollapsed && 'mx-auto',
          )}
        >
          <PanelLeft size={16} aria-hidden="true" />
        </button>
      </div>

      {/* Nav content */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-2">
        <SidebarNav />
        <SidebarRecentProjects />
      </div>

      {/* Footer */}
      <div className="p-2">
        <SidebarFooter />
      </div>
    </motion.aside>
  );
}
