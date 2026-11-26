import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from './redirect';

describe('safeRedirectPath', () => {
  it('keeps same-origin relative paths', () => {
    expect(safeRedirectPath('/projects/123', '/projects')).toBe('/projects/123');
  });

  it.each([
    null,
    undefined,
    '',
    'projects',
    '@evil.com',
    '//evil.com',
    '/\\evil.com',
    'https://evil.com',
  ])('falls back for %s', (value) => {
    expect(safeRedirectPath(value, '/projects')).toBe('/projects');
  });
});
