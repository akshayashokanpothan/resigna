'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar.store';
import { SidebarNav } from './SidebarNav';
import { SidebarRecentProjects } from './SidebarRecentProjects';
import { SidebarFooter } from './SidebarFooter';
import { cn } from '@/shared/utils/cn';
import { transition } from '@/shared/theme/motion';
import { ROUTES } from '@/shared/constants/routes';
import { IconButton } from '@/shared/components/IconButton';
import { Logo, LogoSymbol } from '@/shared/components/Logo';
import { useMediaQuery } from '@/shared/hooks/use-media-query';

export function Sidebar() {
  const { isCollapsed, toggle, collapse, width } = useSidebarStore();
  const isNarrow = useMediaQuery('(max-width: 767px)');

  // On small screens the full sidebar would take most of the width, so start collapsed.
  useEffect(() => {
    if (isNarrow) collapse();
  }, [isNarrow, collapse]);

  return (
    <motion.aside
      animate={{ width }}
      initial={false}
      transition={transition.default}
      className="relative flex h-full shrink-0 flex-col overflow-hidden border-r border-border bg-surface"
      aria-label="Application sidebar"
    >
      {/* Brand + collapse */}
      <div
        className={cn(
          'flex h-12 shrink-0 items-center border-b border-border',
          isCollapsed ? 'justify-center px-2' : 'justify-between pl-4 pr-2',
        )}
      >
        {!isCollapsed && (
          <Link
            href={ROUTES.projects}
            aria-label="Resigna — go to Projects"
            className="rounded-sm focus-ring"
          >
            <Logo height={20} />
          </Link>
        )}
        <IconButton
          icon={isCollapsed ? PanelLeftOpen : PanelLeftClose}
          label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          tooltipSide="right"
          size="sm"
          onClick={toggle}
          aria-expanded={!isCollapsed}
        />
      </div>

      {isCollapsed && (
        <div className="flex justify-center pt-3" aria-hidden="true">
          <LogoSymbol size={20} title="" />
        </div>
      )}

      {/* Nav content */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        <SidebarNav />
        <SidebarRecentProjects />
      </div>

      {/* Footer */}
      <div className="px-2 pb-2">
        <SidebarFooter />
      </div>
    </motion.aside>
  );
}
