# modules/projects

**Status:** Built (Sprint 0). Create/delete mutations exist but have no UI yet.

## Purpose

Research projects scoped to a workspace (`active` or `archived`).

## Public API (`index.ts`)

- Types: `Project`, `CreateProjectInput`, `ProjectRepository`
- Services: `projectsService`
- Hooks: `useProjects(workspaceId)`, `useProject(id)`
- Components: `ProjectCard`, `ProjectList`, `ProjectListSkeleton`

## Constraints

- Supabase access only in `repositories/supabase-project.repository.ts`.
- Row-level security (migration 0003) limits access to workspace members.
