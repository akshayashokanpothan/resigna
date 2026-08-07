import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { SupabaseAuthRepository } from '../repositories/supabase-auth.repository';
import type { AuthRepository } from '../repositories/auth.repository';

/**
 * Auth service factory.
 * Returns a typed AuthRepository backed by Supabase.
 * Components and hooks use this — never instantiate repositories directly.
 */
export function createAuthService(): AuthRepository {
  const supabase = createBrowserSupabaseClient();
  return new SupabaseAuthRepository(supabase);
}

// Singleton for client-side usage
let _authService: AuthRepository | null = null;

export function getAuthService(): AuthRepository {
  if (!_authService) {
    _authService = createAuthService();
  }
  return _authService;
}
