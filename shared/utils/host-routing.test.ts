import { describe, expect, it } from 'vitest';
import { resolveHostRoute } from './host-routing';

const prod = {
  appUrl: 'https://app.resigna.akshayashokanpothan.com',
  landingUrl: 'https://resigna.akshayashokanpothan.com',
};
const preview = {
  appUrl: 'https://resigna-app.vercel.app',
  landingUrl: 'https://resigna.vercel.app',
};

describe('resolveHostRoute', () => {
  it('serves the landing page at / on the landing host', () => {
    expect(
      resolveHostRoute({
        ...prod,
        host: 'resigna.akshayashokanpothan.com',
        pathname: '/',
        search: '',
      }),
    ).toEqual({ kind: 'landing', rewriteTo: '/landing' });
    expect(
      resolveHostRoute({ ...preview, host: 'resigna.vercel.app', pathname: '/', search: '' }),
    ).toEqual({ kind: 'landing', rewriteTo: '/landing' });
  });

  it('sends app paths on the landing host to the app host, keeping the query', () => {
    expect(
      resolveHostRoute({
        ...prod,
        host: 'resigna.akshayashokanpothan.com',
        pathname: '/projects/123',
        search: '?tab=notes',
      }),
    ).toEqual({
      kind: 'redirect',
      to: 'https://app.resigna.akshayashokanpothan.com/projects/123?tab=notes',
    });
    expect(
      resolveHostRoute({ ...preview, host: 'resigna.vercel.app', pathname: '/login', search: '' }),
    ).toEqual({ kind: 'redirect', to: 'https://resigna-app.vercel.app/login' });
  });

  it('serves the app on the app host', () => {
    for (const pathname of ['/', '/login', '/projects']) {
      expect(
        resolveHostRoute({
          ...prod,
          host: 'app.resigna.akshayashokanpothan.com',
          pathname,
          search: '',
        }),
      ).toEqual({ kind: 'app' });
    }
  });

  it('sends /landing on the app host to the landing host', () => {
    expect(
      resolveHostRoute({
        ...preview,
        host: 'resigna-app.vercel.app',
        pathname: '/landing',
        search: '',
      }),
    ).toEqual({ kind: 'redirect', to: 'https://resigna.vercel.app/' });
  });

  it('treats unknown hosts (per-branch previews) as the app, with /landing viewable', () => {
    const host = 'resigna-git-feature-x.vercel.app';
    expect(resolveHostRoute({ ...preview, host, pathname: '/projects', search: '' })).toEqual({
      kind: 'app',
    });
    expect(resolveHostRoute({ ...preview, host, pathname: '/landing', search: '' })).toEqual({
      kind: 'landing',
      rewriteTo: null,
    });
  });

  it('does not split when no landing URL is set', () => {
    const base = { appUrl: 'http://localhost:3000', landingUrl: undefined, host: 'localhost:3000' };
    expect(resolveHostRoute({ ...base, pathname: '/', search: '' })).toEqual({ kind: 'app' });
    expect(resolveHostRoute({ ...base, pathname: '/landing', search: '' })).toEqual({
      kind: 'landing',
      rewriteTo: null,
    });
  });
});
