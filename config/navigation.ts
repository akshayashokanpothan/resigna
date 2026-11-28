import {
  FileText,
  FolderKanban,
  LayoutDashboard,
  Layers,
  Library,
  Settings,
  Users,
  Waypoints,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** What lives here, shown in the tooltip of items that are not built yet. */
  description?: string;
  disabled?: boolean;
}

/**
 * Primary navigation — the product vision's information architecture (§12):
 * Overview, Projects, Research, Participants, Insights, Knowledge, Artifacts.
 * Items not built yet stay visible (so the shape of the product is clear) but disabled.
 */
export const primaryNavItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: ROUTES.home,
    icon: LayoutDashboard,
    description: 'Workspace activity, recent insights and suggested next steps',
    disabled: true,
  },
  {
    id: 'projects',
    label: 'Projects',
    href: ROUTES.projects,
    icon: FolderKanban,
  },
  {
    id: 'research',
    label: 'Research',
    href: ROUTES.research(),
    icon: FileText,
    description: 'Search interviews, transcripts, notes and source material',
  },
  {
    id: 'participants',
    label: 'Participants',
    href: '/participants',
    icon: Users,
    description: 'Participant profiles, attributes and the evidence they contributed',
    disabled: true,
  },
  {
    id: 'insights',
    label: 'Insights',
    href: '/insights',
    icon: Waypoints,
    description: 'Insights, themes, opportunities and their supporting evidence',
    disabled: true,
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    href: '/knowledge',
    icon: Library,
    description: 'Search and explore connected knowledge across projects',
    disabled: true,
  },
  {
    id: 'artifacts',
    label: 'Artifacts',
    href: '/artifacts',
    icon: Layers,
    description: 'Personas, journey maps, reports and research summaries',
    disabled: true,
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
