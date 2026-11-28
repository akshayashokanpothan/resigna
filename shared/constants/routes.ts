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
  project: (id: string, tab?: 'studies' | 'sources' | 'participants') =>
    tab ? `/projects/${id}?tab=${tab}` : `/projects/${id}`,
  study: (projectId: string, studyId: string) => `/projects/${projectId}/studies/${studyId}`,
  source: (projectId: string, sourceId: string) => `/projects/${projectId}/sources/${sourceId}`,
  research: (query?: string) => (query ? `/research?q=${encodeURIComponent(query)}` : '/research'),
  settings: '/settings',
  designSystem: '/design-system',
} as const;
