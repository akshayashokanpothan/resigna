# Resigna Architecture Overview

## The Four Layers

Resigna strictly enforces a four-layer architecture. Dependencies only flow downward.

1. **UI Layer** (`components`, `pages`): Purely presentational. Never calls infrastructure.
2. **Application Layer** (`hooks`, `queries`, `mutations`): Orchestrates business flows. Interacts with repositories.
3. **Domain Layer** (`types`, `schemas`, pure functions): Framework-agnostic business rules.
4. **Infrastructure Layer** (`repositories`): The ONLY layer allowed to talk to Supabase or external APIs.

## Modules

The application is built around vertical slices called modules:

- `auth`
- `workspace`
- `projects`
- `shell` (UI shell)
- `research` (Reserved)
- `knowledge` (Reserved)
- `ai` (Reserved)
- `renderers` (Reserved)

Each module exposes its public API through `index.ts`. Cross-module imports MUST only reference `index.ts`.

## Platform First

The web application is the core product and the sole owner of business logic. External integrations (like the Figma plugin) are strictly thin renderers that consume Resigna's API. They do not own any logic or data transformations.

See `docs/adr/` for the complete architecture decision records.
