import type { SupabaseClient } from '@supabase/supabase-js';
import { AuthError } from '@/shared/errors';
import { ErrorCode } from '@/shared/errors/error-codes';
import type {
  AuthUser,
  OAuthProvider,
  Session,
  SignUpCredentials,
  SignUpResult,
} from '../types/auth.types';
import type { AuthRepository } from './auth.repository';
import { env } from '@/config/env';

function mapUser(user: {
  id: string;
  email?: string;
  user_metadata?: { name?: string; avatar_url?: string };
  created_at?: string;
}): AuthUser {
  return {
    id: user.id,
    email: user.email ?? '',
    name: user.user_metadata?.name ?? null,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
    createdAt: user.created_at ?? new Date().toISOString(),
  };
}

/**
 * Supabase implementation of AuthRepository.
 * The only place in the codebase that touches Supabase auth APIs.
 */
export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getSession(): Promise<Session | null> {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) throw new AuthError(error.message, ErrorCode.SESSION_EXPIRED);
    if (!data.session) return null;

    return {
      user: mapUser(data.session.user),
      accessToken: data.session.access_token,
      expiresAt: data.session.expires_at ?? 0,
    };
  }

  async getUser(): Promise<AuthUser | null> {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) throw new AuthError(error.message);
    if (!data.user) return null;
    return mapUser(data.user);
  }

  async signInWithEmail(email: string, password: string): Promise<Session> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw new AuthError(error.message, ErrorCode.INVALID_CREDENTIALS, error);
    if (!data.session) throw new AuthError('No session returned', ErrorCode.UNAUTHORIZED);

    return {
      user: mapUser(data.session.user),
      accessToken: data.session.access_token,
      expiresAt: data.session.expires_at ?? 0,
    };
  }

  async signUp(credentials: SignUpCredentials): Promise<SignUpResult> {
    const { email, password, metadata } = credentials;
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw new AuthError(error.message, ErrorCode.SIGNUP_FAILED, error);

    const user = data.user ? mapUser(data.user) : null;
    const session = data.session
      ? {
          user: mapUser(data.session.user),
          accessToken: data.session.access_token,
          expiresAt: data.session.expires_at ?? 0,
        }
      : null;

    return { user, session };
  }

  async signInWithOAuth(provider: OAuthProvider): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      },
    });
    if (error) throw new AuthError(error.message, ErrorCode.OAUTH_FAILED, error);
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new AuthError(error.message);
  }
}
