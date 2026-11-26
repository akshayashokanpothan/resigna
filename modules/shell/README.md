# modules/shell

**Status:** Built (Sprint 0).

## Purpose

The signed-in app frame: collapsible sidebar, top bar with breadcrumbs and user menu, and the `cmdk` command palette.

## Public API (`index.ts`)

- `Sidebar`, `Topbar`, `CommandPalette`

## Constraints

- Presentation and navigation only. Data comes from other modules' public hooks
  (`@/modules/auth`, `@/modules/projects`, `@/modules/workspace`).
- UI state (collapsed, palette open) lives in `stores/` (Zustand).
