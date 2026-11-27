import type { Project } from '../types/project.types';

/**
 * Splits projects into active and archived, keeping the incoming order
 * (most recently updated first) within each group.
 */
export function partitionProjectsByStatus(projects: readonly Project[]): {
  active: Project[];
  archived: Project[];
} {
  const active: Project[] = [];
  const archived: Project[] = [];
  for (const project of projects) {
    (project.status === 'archived' ? archived : active).push(project);
  }
  return { active, archived };
}

/** Empty or whitespace-only descriptions are stored as null. */
export function normalizeDescription(description: string | undefined | null): string | null {
  const trimmed = description?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}
