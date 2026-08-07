import {
  Home,
  FolderOpen,
  Brain,
  LayoutTemplate,
  Puzzle,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  disabledReason?: string;
}

export const primaryNavItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: ROUTES.home,
    icon: Home,
  },
  {
    id: 'projects',
    label: 'Projects',
    href: ROUTES.projects,
    icon: FolderOpen,
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    href: '/knowledge',
    icon: Brain,
    disabled: true,
    disabledReason: 'Coming in a future sprint',
  },
  {
    id: 'deliverables',
    label: 'Deliverables',
    href: '/deliverables',
    icon: LayoutTemplate,
    disabled: true,
    disabledReason: 'Coming in a future sprint',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    href: '/integrations',
    icon: Puzzle,
    disabled: true,
    disabledReason: 'Coming in a future sprint',
  },
];

export const bottomNavItems: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    href: ROUTES.settings,
    icon: Settings,
  },
];
