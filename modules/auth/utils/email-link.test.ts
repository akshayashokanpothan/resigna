import { describe, expect, it } from 'vitest';
import { buildEmailRedirectUrl, parseEmailOtpType, readEmailLinkParams } from './email-link';

describe('buildEmailRedirectUrl', () => {
  it('points at the confirm route with an encoded next path', () => {
    expect(buildEmailRedirectUrl('https://app.example.com/', '/projects/1?tab=studies')).toBe(
      'https://app.example.com/api/auth/confirm?next=%2Fprojects%2F1%3Ftab%3Dstudies',
    );
  });

  it('always has a query so templates can append &token_hash=', () => {
    expect(buildEmailRedirectUrl('http://localhost:3000', '/projects')).toContain('?next=');
  });
});

describe('parseEmailOtpType', () => {
  it.each(['email', 'signup', 'magiclink', 'recovery', 'invite', 'email_change'])(
    'accepts %s',
    (t) => expect(parseEmailOtpType(t)).toBe(t),
  );

  it.each([null, '', 'sms', 'EMAIL'])('rejects %s', (t) => {
    expect(parseEmailOtpType(t)).toBeNull();
  });
});

describe('readEmailLinkParams', () => {
  it('reads a token hash link', () => {
    const p = readEmailLinkParams(
      new URLSearchParams('next=%2Fsettings&token_hash=abc&type=email'),
      '/projects',
    );
    expect(p).toEqual({ tokenHash: 'abc', type: 'email', code: null, next: '/settings' });
  });

  it('blocks an off-site next', () => {
    const p = readEmailLinkParams(new URLSearchParams('next=%2F%2Fevil.com&code=x'), '/projects');
    expect(p.next).toBe('/projects');
    expect(p.code).toBe('x');
  });
});
