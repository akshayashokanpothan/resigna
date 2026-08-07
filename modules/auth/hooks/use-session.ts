'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/query-keys';
import { getAuthService } from '../services/auth.service';

/**
 * Returns the current authenticated user.
 * Returns null if not authenticated.
 */
export function useSession() {
  const authService = getAuthService();

  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: () => authService.getSession(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCurrentUser() {
  const { data: session, ...rest } = useSession();
  return { user: session?.user ?? null, ...rest };
}
