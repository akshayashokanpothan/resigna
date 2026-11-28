/**
 * Route constants.
 * Never hardcode route strings in components.
 * Always import from here.
 */
export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  landing: '/landing',
  projects: '/projects',
  project: (id: string) => `/projects/${id}`,
  settings: '/settings',
  designSystem: '/design-system',
} as const;
