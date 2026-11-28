/**
 * Decides which site a request belongs to when the landing page and the app
 * live on separate hosts:
 *
 *   Production  landing resigna.akshayashokanpothan.com   app app.resigna.akshayashokanpothan.com
 *   Preview     landing beta.resigna.akshayashokanpothan.com  app appbeta.resigna.akshayashokanpothan.com
 *
 * When NEXT_PUBLIC_LANDING_URL is not set (local dev, CI) there is no split:
 * every host is the app, and the landing page is still reachable at /landing.
 */

import { ROUTES } from '@/shared/constants/routes';

export const LANDING_PATH = ROUTES.landing;

export type HostRoute =
  /** Serve the app as usual (auth checks apply). */
  | { kind: 'app' }
  /** Serve the landing page for this request without auth checks. */
  | { kind: 'landing'; rewriteTo: string | null }
  /** Send the browser to another host. */
  | { kind: 'redirect'; to: string };

interface ResolveHostRouteInput {
  /** The request's Host header, e.g. `beta.resigna.akshayashokanpothan.com` or `localhost:3000`. */
  host: string | null;
  pathname: string;
  search: string;
  appUrl: string;
  landingUrl: string | undefined;
}

function hostOf(url: string): string {
  return new URL(url).host.toLowerCase();
}

export function resolveHostRoute({
  host,
  pathname,
  search,
  appUrl,
  landingUrl,
}: ResolveHostRouteInput): HostRoute {
  const requestHost = host?.toLowerCase() ?? '';

  // No split configured, or both URLs point at the same host.
  if (!landingUrl || hostOf(landingUrl) === hostOf(appUrl)) {
    return pathname === LANDING_PATH ? { kind: 'landing', rewriteTo: null } : { kind: 'app' };
  }

  if (requestHost === hostOf(landingUrl)) {
    if (pathname === '/') return { kind: 'landing', rewriteTo: LANDING_PATH };
    if (pathname === LANDING_PATH) return { kind: 'redirect', to: new URL('/', landingUrl).href };
    // Anything else on the landing host belongs to the app (old links, /login, /projects/...).
    return { kind: 'redirect', to: new URL(pathname + search, appUrl).href };
  }

  // On the app host (or any other host, e.g. per-branch Vercel previews),
  // the landing page lives on its own host.
  if (pathname === LANDING_PATH && requestHost === hostOf(appUrl)) {
    return { kind: 'redirect', to: new URL('/', landingUrl).href };
  }

  return pathname === LANDING_PATH ? { kind: 'landing', rewriteTo: null } : { kind: 'app' };
}
