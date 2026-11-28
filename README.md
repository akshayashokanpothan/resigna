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

## Domains

The landing page and the app are served by the same Vercel project on separate hosts. `proxy.ts` picks the site from the request host (see `shared/utils/host-routing.ts`).

| Environment     | Branch | Landing page                           | App                                       |
| --------------- | ------ | -------------------------------------- | ----------------------------------------- |
| Production (GA) | `main` | `resigna.akshayashokanpothan.com`      | `app.resigna.akshayashokanpothan.com`     |
| Preview (BA)    | `dev`  | `beta.resigna.akshayashokanpothan.com` | `appbeta.resigna.akshayashokanpothan.com` |

Set `NEXT_PUBLIC_APP_URL` to the app URL and `NEXT_PUBLIC_LANDING_URL` to the landing URL for each environment. App paths opened on the landing host redirect to the app host. Leave `NEXT_PUBLIC_LANDING_URL` unset locally: everything runs on one host and the landing page is at `/landing`.

## Read before contributing

- [`ENGINEERING_CONSTITUTION.md`](ENGINEERING_CONSTITUTION.md): rules every change follows
- [`docs/adr/`](docs/adr): architecture decisions
- [`docs/architecture/overview.md`](docs/architecture/overview.md)
- [`docs/engineering/onboarding.md`](docs/engineering/onboarding.md)
