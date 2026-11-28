import type { EmailOtpType } from '@supabase/supabase-js';
import { safeRedirectPath } from '@/shared/utils/redirect';

/** Path of the route that verifies email links (magic link, signup confirmation). */
export const EMAIL_CONFIRM_PATH = '/api/auth/confirm';

/**
 * The redirect URL sent with every auth email.
 *
 * It always carries a `?next=` query, so the email templates can append
 * `&token_hash={{ .TokenHash }}&type=...` to `{{ .RedirectTo }}` and the link
 * lands on the same host (BA or GA) the user asked from.
 */
export function buildEmailRedirectUrl(appUrl: string, next: string): string {
  const base = appUrl.replace(/\/+$/, '');
  return `${base}${EMAIL_CONFIRM_PATH}?next=${encodeURIComponent(next)}`;
}

const EMAIL_OTP_TYPES: readonly EmailOtpType[] = [
  'email',
  'signup',
  'magiclink',
  'invite',
  'recovery',
  'email_change',
];

/** Narrow the `type` query param of an email link to a type verifyOtp accepts. */
export function parseEmailOtpType(value: string | null): EmailOtpType | null {
  return value && (EMAIL_OTP_TYPES as readonly string[]).includes(value)
    ? (value as EmailOtpType)
    : null;
}

export interface EmailLinkParams {
  tokenHash: string | null;
  type: EmailOtpType | null;
  code: string | null;
  next: string;
}

/** Read an email link's query: token hash flow (any device) or PKCE code flow (same browser). */
export function readEmailLinkParams(
  searchParams: URLSearchParams,
  fallbackNext: string,
): EmailLinkParams {
  return {
    tokenHash: searchParams.get('token_hash'),
    type: parseEmailOtpType(searchParams.get('type')),
    code: searchParams.get('code'),
    next: safeRedirectPath(searchParams.get('next'), fallbackNext),
  };
}
