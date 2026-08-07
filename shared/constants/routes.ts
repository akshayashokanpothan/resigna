/**
 * Route constants.
 * Never hardcode route strings in components.
 * Always import from here.
 */
export const ROUTES = {
  home: '/',
  login: '/login',
  projects: '/projects',
  project: (id: string) => `/projects/${id}`,
  settings: '/settings',
} as const;
