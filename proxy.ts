import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { JWK } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/config/env';
import { resolveHostRoute } from '@/shared/utils/host-routing';

const PUBLIC_ROUTES = ['/login', '/signup'];

/**
 * Optional pinned copy of the project's public JWT signing keys (the JSON served at
 * <SUPABASE_URL>/auth/v1/.well-known/jwks.json). The proxy runs at the Vercel edge closest to the
 * user, and each fresh instance otherwise fetches the keys from Supabase in Sydney first, which
 * measured 0.7–1 s from Mumbai. These are public keys, not secrets. If Supabase rotates to a key
 * that isn't listed here, getClaims falls back to fetching the live set, so a stale value only
 * costs speed, never correctness.
 */
const PINNED_JWKS = parseJwks(process.env.SUPABASE_JWKS);

function parseJwks(raw: string | undefined): { keys: JWK[] } | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as { keys?: unknown };
    return Array.isArray(parsed.keys) && parsed.keys.length > 0
      ? { keys: parsed.keys as JWK[] }
      : undefined;
  } catch {
    return undefined;
  }
}
const AUTH_ONLY_ROUTES = ['/login', '/signup'];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Landing page and app live on separate hosts (see shared/utils/host-routing.ts).
  // The landing page is public, so it skips the Supabase session check entirely.
  const hostRoute = resolveHostRoute({
    host: request.headers.get('host'),
    pathname,
    search,
    appUrl: env.NEXT_PUBLIC_APP_URL,
    landingUrl: env.NEXT_PUBLIC_LANDING_URL,
  });
  if (hostRoute.kind === 'redirect') {
    return NextResponse.redirect(hostRoute.to, 308);
  }
  if (hostRoute.kind === 'landing') {
    return hostRoute.rewriteTo
      ? NextResponse.rewrite(new URL(hostRoute.rewriteTo, request.url))
      : NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getClaims() verifies the access token's signature (so a spoofed cookie is rejected) and
  // refreshes an expired session for Server Components. With asymmetric JWT signing keys it
  // verifies locally against the cached JWKS, so most requests make no call to Supabase Auth.
  // getUser() made a network round trip on every navigation and prefetch, which was the main
  // delay after each click. With a legacy shared-secret key, getClaims() falls back to the
  // same Auth server check getUser() did, so it is never less safe.
  const { data } = await supabase.auth.getClaims(
    undefined,
    PINNED_JWKS ? { jwks: PINNED_JWKS } : undefined,
  );
  const user = data?.claims?.sub ? data.claims : null;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);
  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some((route) => pathname === route);

  // Redirect unauthenticated users to login
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth-only routes
  if (user && isAuthOnlyRoute) {
    return NextResponse.redirect(new URL('/projects', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - brand assets and metadata files (logos, illustrations, icons, manifest, social images),
     *   so the sign-in page and link previews can load them without a session
     * - api/auth/ (OAuth callback and email link routes must be public)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|brand/|icon\\.png|apple-icon\\.png|manifest\\.webmanifest|opengraph-image|twitter-image|api/auth/).*)',
  ],
};
