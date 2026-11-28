import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { ROUTES } from '@/shared/constants/routes';
import { safeRedirectPath } from '@/shared/utils/redirect';

/**
 * Auth callback handler.
 * Supabase redirects here after Google/GitHub OAuth and after email
 * confirmation links. Exchanges the auth code for a session and redirects
 * to /projects.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeRedirectPath(searchParams.get('next'), ROUTES.projects);

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // No code (Supabase sends `error` instead when a link is expired or used),
  // or the exchange failed, e.g. a confirmation link opened in another browser.
  return NextResponse.redirect(`${origin}${ROUTES.login}?error=auth_failed`);
}
