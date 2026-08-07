import type {
  AuthUser,
  OAuthProvider,
  Session,
  SignUpCredentials,
  SignUpResult,
} from '../types/auth.types';

/**
 * Auth repository interface.
 * Application layer depends on this — never on Supabase directly.
 */
export interface AuthRepository {
  getSession(): Promise<Session | null>;
  getUser(): Promise<AuthUser | null>;
  signInWithEmail(email: string, password: string): Promise<Session>;
  signUp(credentials: SignUpCredentials): Promise<SignUpResult>;
  signInWithOAuth(provider: OAuthProvider): Promise<void>;
  signOut(): Promise<void>;
}
