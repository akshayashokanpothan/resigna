# End-to-end tests

Playwright tests for the critical flows: sign up, sign in and out, protected-route redirects, and creating, renaming and archiving a project.

They run against the **local Supabase stack**, never the live project. Test users are created through the local admin API, and the helper refuses any Supabase URL that isn't `localhost` or `127.0.0.1`.

## Run locally

```bash
npm run db:start      # Docker must be running; applies supabase/migrations
npm run test:e2e      # starts `next dev` on port 3100 and runs the suite
```

`playwright.config.ts` reads the local URL and keys from `supabase status`, so `.env.local` can keep pointing wherever you develop against. Run `npx playwright install chromium` once if Playwright asks for a browser.

## In CI

The `E2E (Playwright)` job in `.github/workflows/ci.yml` starts the same local stack, builds the app against it, and runs the suite on every push and pull request to `dev` and `main`. On failure, the HTML report is uploaded as the `playwright-report` artifact.
