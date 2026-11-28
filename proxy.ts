import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/config/env';
import { resolveHostRoute } from '@/shared/utils/host-routing';

const PUBLIC_ROUTES = ['/login', '/signup'];
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
  const { data } = await supabase.auth.getClaims();
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
     * - api/auth/callback (OAuth callback must be public)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/auth/callback).*)',
  ],
};
