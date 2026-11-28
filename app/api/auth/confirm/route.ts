import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ROUTES } from '@/shared/constants/routes';
import { readEmailLinkParams } from '@/modules/auth/utils/email-link';

/**
 * Email link handler: magic link sign-in and signup confirmation.
 *
 * - `token_hash` + `type` (from our email templates): verified on the server, so the link
 *   works on any device or browser, not only the one that asked for it.
 * - `code` (Supabase's default templates, PKCE): exchanged for a session; only works in the
 *   browser that requested the email.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const { tokenHash, type, code, next } = readEmailLinkParams(searchParams, ROUTES.projects);
  const supabase = await createServerSupabaseClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}${ROUTES.login}?error=link_expired`);
}
