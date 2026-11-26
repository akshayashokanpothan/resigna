import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { ROUTES } from '@/shared/constants/routes';
import { safeRedirectPath } from '@/shared/utils/redirect';

/**
 * OAuth callback handler.
 * Supabase redirects here after Google/GitHub OAuth.
 * Exchanges the auth code for a session and redirects to /projects.
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

  // Redirect to login with error state if code exchange fails
  return NextResponse.redirect(`${origin}${ROUTES.login}?error=oauth_failed`);
}
