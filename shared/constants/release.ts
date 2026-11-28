/**
 * Release channel, so testers can tell BA from GA at a glance.
 *
 *   GA (General Access) — Vercel production (`main`): no beta marks.
 *   BA (Beta Access)    — Vercel preview (`dev`, branch previews) and local dev:
 *                         "Resigna Beta" tab title, Beta badge next to the logo,
 *                         beta favicon and an amber strip along the top of every page.
 *
 * Set at build time in next.config.ts from VERCEL_ENV. Override with
 * NEXT_PUBLIC_RELEASE_CHANNEL=ga|beta.
 */
export type ReleaseChannel = 'ga' | 'beta';

export const RELEASE_CHANNEL: ReleaseChannel =
  process.env.NEXT_PUBLIC_RELEASE_CHANNEL === 'ga' ? 'ga' : 'beta';

export const IS_BETA = RELEASE_CHANNEL === 'beta';
