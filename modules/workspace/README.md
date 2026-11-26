# modules/workspace

**Status:** Built (Sprint 0). Single workspace per user for now.

## Purpose

Workspaces own projects. Each user gets one default workspace at signup (database trigger in migration 0004).

## Public API (`index.ts`)

- Types: `Workspace`, `WorkspaceMember`, `WorkspaceRepository`
- Services: `workspaceService`
- Hooks: `useWorkspaces`, `useFirstWorkspace`
- Domain: `deriveWorkspaceName`, `generateWorkspaceSlug` (pure, unit tested)

## Constraints

- Supabase access only in `repositories/supabase-workspace.repository.ts`.
- Workspace switching is not built; the app uses the first workspace.
