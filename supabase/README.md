# Supabase

The database schema lives in `migrations/`. Every change to the live database goes through a new migration file here; nothing is changed by hand in the dashboard.

The Supabase CLI is a dev dependency (pinned in `package.json`), so use it through `npx supabase …` or the `db:*` npm scripts. It needs Docker for the local stack.

## Migration history

| Version | File                                | What it does                                                       |
| ------- | ----------------------------------- | ------------------------------------------------------------------ |
| 0001    | `0001_create_workspaces.sql`        | Workspaces table, owner RLS, `updated_at` trigger function         |
| 0002    | `0002_create_workspace_members.sql` | Workspace members table and RLS                                    |
| 0003    | `0003_create_projects.sql`          | Projects table, member RLS, indexes                                |
| 0004    | `0004_workspace_trigger.sql`        | Creates a workspace and owner membership for each new user         |
| 0005    | `0005_security_rls_fixes.sql`       | Security and RLS fixes, slug fix, missing FK indexes (26 Nov 2026) |

0001 to 0004 were first run by hand in the SQL Editor, and 0005 was run by hand on 26 Nov 2026. On 27 Nov 2026 the live schema (tables, columns, constraints, indexes, RLS policies, functions, grants and triggers) was compared with a fresh database built from these five files, and they match. The live project's migration history (`supabase_migrations.schema_migrations`) is baselined to 0001–0005, so the CLI treats them as applied and only pushes newer files.

New migrations take the next number: `0006_<name>.sql`, `0007_<name>.sql`, and so on.

## Local development

```bash
npm run db:start    # start Postgres, Auth and the API in Docker, apply all migrations
npm run db:status   # print the local API URL and publishable key
npm run db:reset    # rebuild the local database from migrations/
npm run db:stop
```

Point the app at the local stack by putting the values from `db:status` in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key from db:status>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Locally, email confirmation is off, so sign-up logs you straight in. Emails the local stack sends are visible in Mailpit at http://127.0.0.1:54324.

## Applying a migration to the live project

```bash
npx supabase login
npx supabase link --project-ref xhacaomothqdghisvnap
npx supabase migration list   # local vs remote; 0001–0005 should show on both sides
npx supabase db push          # applies only migrations the remote hasn't recorded
```

Run `db push` only after the migration is merged into `dev` and checked locally with `db:reset`.

## How the baseline was recorded

If the history ever needs recording again (for example on a new project restored from a dump), mark the existing files as applied without running them:

```bash
npx supabase migration repair --status applied 0001 0002 0003 0004 0005
```
