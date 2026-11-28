import { describe, expect, it } from 'vitest';
import { ErrorCode } from '@/shared/errors/error-codes';
import { getAuthErrorMessage, toAuthError } from './auth-errors';

describe('toAuthError', () => {
  it.each([
    [{ message: 'x', code: 'invalid_credentials', status: 400 }, ErrorCode.INVALID_CREDENTIALS],
    [{ message: 'x', code: 'email_not_confirmed', status: 400 }, ErrorCode.EMAIL_NOT_CONFIRMED],
    [
      { message: 'x', code: 'user_already_exists', status: 422 },
      ErrorCode.EMAIL_ALREADY_REGISTERED,
    ],
    [{ message: 'x', code: 'weak_password', status: 422 }, ErrorCode.WEAK_PASSWORD],
    [{ message: 'x', code: 'over_email_send_rate_limit', status: 429 }, ErrorCode.RATE_LIMITED],
    [{ message: 'x', status: 429 }, ErrorCode.RATE_LIMITED],
    [{ message: 'x', code: 'unexpected_failure', status: 500 }, ErrorCode.AUTH_SERVICE_UNAVAILABLE],
    [{ message: 'x', status: 400 }, ErrorCode.SIGNUP_FAILED],
  ])('maps %o to %s', (input, expected) => {
    expect(toAuthError(input, ErrorCode.SIGNUP_FAILED).code).toBe(expected);
  });
});

describe('getAuthErrorMessage', () => {
  it('does not call a server failure "invalid credentials"', () => {
    const err = toAuthError({ message: 'db error', status: 500 }, ErrorCode.INVALID_CREDENTIALS);
    expect(getAuthErrorMessage(err, 'fallback')).toMatch(/trouble/);
  });

  it('falls back for unknown errors', () => {
    expect(getAuthErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
  });
});
