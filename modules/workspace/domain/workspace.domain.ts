import { slugify } from '@/shared/utils/format';

/**
 * Pure domain logic for workspace operations.
 * Zero framework dependencies — safe to unit test in isolation.
 */

/**
 * Derives a workspace name from a user's display name or email.
 * Used during automatic workspace creation on signup.
 *
 * @example
 * deriveWorkspaceName('john.doe@acme.com') → "John Doe's Workspace"
 * deriveWorkspaceName('Sarah Connor')       → "Sarah Connor's Workspace"
 */
export function deriveWorkspaceName(nameOrEmail: string): string {
  if (!nameOrEmail.includes('@')) {
    return `${nameOrEmail}'s Workspace`;
  }

  const localPart = nameOrEmail.split('@')[0] ?? nameOrEmail;
  const humanized = localPart
    .replace(/[._-]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return `${humanized}'s Workspace`;
}

/**
 * Generates a unique workspace slug from a name.
 * Slug will be validated for uniqueness at the infrastructure layer.
 */
export function generateWorkspaceSlug(name: string): string {
  return slugify(name);
}
