'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/constants/routes';
import { toast } from '@/shared/utils/toast';
import { getAuthService } from '../services/auth.service';

export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const authService = getAuthService();

  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      queryClient.clear();
      router.push(ROUTES.login);
    },
    onError: (error) => {
      toast.error('Failed to sign out. Please try again.', error);
    },
  });
}
