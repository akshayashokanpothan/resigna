/**
 * Returns `path` only if it is a same-origin relative path, otherwise `fallback`.
 * Stops `?next=` / `?redirectedFrom=` values from sending users to another site
 * (e.g. `@evil.com` or `//evil.com`).
 */
export function safeRedirectPath(path: string | null | undefined, fallback: string): string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) {
    return fallback;
  }
  return path;
}
