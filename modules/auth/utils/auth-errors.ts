import { AppError, AuthError } from '@/shared/errors';
import { ErrorCode } from '@/shared/errors/error-codes';

/**
 * Shape of the error objects returned by supabase-js auth calls.
 * `code` is Supabase's machine-readable error code (e.g. `invalid_credentials`).
 */
export interface SupabaseAuthErrorLike {
  message: string;
  code?: string;
  status?: number;
}

const CODE_MAP: Record<string, ErrorCode> = {
  invalid_credentials: ErrorCode.INVALID_CREDENTIALS,
  email_not_confirmed: ErrorCode.EMAIL_NOT_CONFIRMED,
  user_already_exists: ErrorCode.EMAIL_ALREADY_REGISTERED,
  email_exists: ErrorCode.EMAIL_ALREADY_REGISTERED,
  weak_password: ErrorCode.WEAK_PASSWORD,
  over_email_send_rate_limit: ErrorCode.RATE_LIMITED,
  over_request_rate_limit: ErrorCode.RATE_LIMITED,
  over_sms_send_rate_limit: ErrorCode.RATE_LIMITED,
};

/**
 * Convert a Supabase auth error into an AuthError with a specific ErrorCode,
 * so the UI can tell "wrong password" apart from "server is broken".
 */
export function toAuthError(error: SupabaseAuthErrorLike, fallback: ErrorCode): AuthError {
  let code = (error.code && CODE_MAP[error.code]) || undefined;
  if (!code && error.status === 429) code = ErrorCode.RATE_LIMITED;
  if (!code && (error.status ?? 0) >= 500) code = ErrorCode.AUTH_SERVICE_UNAVAILABLE;
  if (!code && error.code === 'unexpected_failure') code = ErrorCode.AUTH_SERVICE_UNAVAILABLE;
  return new AuthError(error.message, code ?? fallback, error);
}

const MESSAGES: Partial<Record<ErrorCode, string>> = {
  [ErrorCode.INVALID_CREDENTIALS]: 'Incorrect email or password.',
  [ErrorCode.EMAIL_NOT_CONFIRMED]:
    'Please confirm your email first. Check your inbox for the confirmation link.',
  [ErrorCode.EMAIL_ALREADY_REGISTERED]:
    'An account with this email already exists. Try signing in instead.',
  [ErrorCode.WEAK_PASSWORD]: 'That password is too weak. Please choose a stronger one.',
  [ErrorCode.RATE_LIMITED]: 'Too many attempts. Please wait a few minutes and try again.',
  [ErrorCode.AUTH_SERVICE_UNAVAILABLE]:
    'Our sign-in service is having trouble right now. Please try again later.',
};

/** User-facing message for an auth error, or `fallback` when nothing more specific applies. */
export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AppError) return MESSAGES[error.code] ?? fallback;
  return fallback;
}
