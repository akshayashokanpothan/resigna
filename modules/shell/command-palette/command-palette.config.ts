import { ROUTES } from '@/shared/constants/routes';
import { FolderOpen, Plus, Settings } from 'lucide-react';

export interface CommandItem {
  id: string;
  label: string;
  group: 'navigation' | 'actions' | 'account';
  shortcut?: string;
  href?: string;
  action?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

export const commandItems: CommandItem[] = [
  // Navigation
  {
    id: 'go-projects',
    label: 'Go to Projects',
    group: 'navigation',
    href: ROUTES.projects,
    icon: FolderOpen,
  },
  {
    id: 'go-settings',
    label: 'Go to Settings',
    group: 'navigation',
    href: ROUTES.settings,
    icon: Settings,
  },

  // Actions
  {
    id: 'new-project',
    label: 'New project',
    group: 'actions',
    action: 'new-project',
    icon: Plus,
  },

  // Account
  {
    id: 'sign-out',
    label: 'Sign out',
    group: 'account',
    action: 'sign-out',
  },
];

export const commandGroups: { id: CommandItem['group']; label: string }[] = [
  { id: 'navigation', label: 'Navigation' },
  { id: 'actions', label: 'Actions' },
  { id: 'account', label: 'Account' },
];
