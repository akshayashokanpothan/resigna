# Resigna

Resigna turns qualitative UX research (interviews, surveys, notes) into evidence-backed affinity maps, personas, journey maps and "How might we" statements. Everything flows through a shared Knowledge Model, so every claim in a deliverable links back to the quote it came from.

**Status:** Sprint 0 foundation is live: sign-in, an automatic workspace per user, projects (create, edit, archive), the app shell, CI and end-to-end tests. Research upload, the knowledge canvas and AI generation come next (see the roadmap).

|             | URL                                     | Branch |
| ----------- | --------------------------------------- | ------ |
| Production  | https://resigna.akshayashokanpothan.com | `main` |
| Dev preview | https://resigna.vercel.app              | `dev`  |

## Stack

Next.js 16 (App Router), React 19, TypeScript (strict), Supabase (Postgres, Auth, RLS), TanStack Query, Zustand, Tailwind CSS 4, Vitest, Playwright. Hosted on Vercel.

## Getting started

Requires Node.js 22+ and, for the local database, Docker.

```bash
npm install
npm run db:start                    # local Supabase in Docker, applies supabase/migrations
npm run db:status                   # prints the local API URL and publishable key
cp .env.local.example .env.local    # paste those two values in
npm run dev                         # http://localhost:3000
```

Locally, email confirmation is off, so you can sign up straight away. To work against the hosted project instead, put its URL and publishable key in `.env.local`.

## Scripts

| Command             | What it does                                          |
| ------------------- | ----------------------------------------------------- |
| `npm run dev`       | Dev server                                            |
| `npm run build`     | Production build (needs the env vars above)           |
| `npm run lint`      | ESLint                                                |
| `npm run typecheck` | TypeScript, no emit                                   |
| `npm run format`    | Prettier, write                                       |
| `npm test`          | Vitest unit tests                                     |
| `npm run test:e2e`  | Playwright end-to-end tests (needs `db:start`)        |
| `npm run db:start`  | Start local Supabase                                  |
| `npm run db:reset`  | Rebuild the local database from `supabase/migrations` |
| `npm run db:status` | Show local Supabase URLs and keys                     |
| `npm run db:stop`   | Stop local Supabase                                   |

A pre-commit hook (Husky + lint-staged) runs ESLint, Prettier and the type check on staged files.

## Project layout

```
app/          Next.js routes: (auth) login and signup, (shell) the signed-in app
modules/      Feature modules (auth, workspace, projects, shell, …); import them only through index.ts
shared/       Design tokens, shared components, errors, logger, utilities
stores/       Zustand stores for UI state
lib/          Supabase clients
supabase/     Migrations and local Supabase config (see supabase/README.md)
e2e/          Playwright tests (see e2e/README.md)
docs/         ADRs, architecture overview, onboarding
```

## How changes ship

1. Branch from `dev` and open a pull request into `dev`.
2. CI runs lint, type check, unit tests, build and the Playwright suite. Vercel posts a preview.
3. After merging, check the change on the dev preview.
4. Release by opening a pull request from `dev` into `main`, merged with a merge commit so the branches stay in sync. `main` deploys to production.

Database changes go in a new numbered file in `supabase/migrations/` and are pushed with the Supabase CLI after review. See [`supabase/README.md`](supabase/README.md).

Dependabot opens weekly dependency updates against `dev`.

## Read before contributing

- [`ENGINEERING_CONSTITUTION.md`](ENGINEERING_CONSTITUTION.md): rules every change follows
- [`docs/adr/`](docs/adr): architecture decisions
- [`docs/architecture/overview.md`](docs/architecture/overview.md)
- [`docs/engineering/onboarding.md`](docs/engineering/onboarding.md)
