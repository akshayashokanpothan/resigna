import { defineConfig, devices } from '@playwright/test';
import { execSync } from 'node:child_process';

/**
 * E2E tests run against the local Supabase stack (`npm run db:start`), never the live project.
 * Its URL and keys are read from `supabase status` unless they are already in the environment.
 */
function loadLocalSupabaseEnv(): void {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY) return;
  let output: string;
  try {
    output = execSync('npx supabase status -o env', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    throw new Error('Local Supabase is not running. Start it with `npm run db:start`.');
  }
  const values = Object.fromEntries(
    output
      .split('\n')
      .map((line) => line.match(/^([A-Z_]+)="?(.*?)"?$/))
      .filter((match): match is RegExpMatchArray => match !== null)
      .map((match) => [match[1], match[2]]),
  );
  process.env.NEXT_PUBLIC_SUPABASE_URL = values.API_URL;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = values.PUBLISHABLE_KEY;
  process.env.SUPABASE_SECRET_KEY = values.SECRET_KEY;
}

loadLocalSupabaseEnv();

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // CI builds once and serves the production build; locally a dev server is enough.
    command: process.env.CI ? `npx next start -p ${PORT}` : `npx next dev -p ${PORT}`,
    url: `${baseURL}/login`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
      NEXT_PUBLIC_APP_URL: baseURL,
    },
  },
});
