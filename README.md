# Resigna

Turns qualitative UX research into evidence-backed affinity maps, personas, journey maps and HMW statements through a shared Knowledge Model.

Stack: Next.js 16 (App Router), React 19, TypeScript, Supabase, TanStack Query, Zustand, Tailwind CSS 4.

## Getting started

Requires Node.js 22 or newer.

```bash
cp .env.local.example .env.local   # fill in your Supabase URL and publishable key
npm install
npm run dev
```

Apply the SQL in `supabase/migrations/` to your Supabase project in order.

## Scripts

| Command             | What it does                                |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Start the dev server                        |
| `npm run lint`      | ESLint                                      |
| `npm run typecheck` | TypeScript, no emit                         |
| `npm test`          | Vitest unit tests                           |
| `npm run test:e2e`  | Playwright end-to-end tests                 |
| `npm run build`     | Production build (needs the env vars above) |

## Read before contributing

- [`ENGINEERING_CONSTITUTION.md`](ENGINEERING_CONSTITUTION.md): rules every change follows
- [`docs/adr/`](docs/adr): architecture decisions
- [`docs/architecture/overview.md`](docs/architecture/overview.md)
- [`docs/engineering/onboarding.md`](docs/engineering/onboarding.md)
