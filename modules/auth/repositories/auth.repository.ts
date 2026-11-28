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
  /** Email a one-time sign-in link and 6-digit code. Creates the account if it doesn't exist. */
  sendMagicLink(email: string, next?: string): Promise<void>;
  /** Sign in with the 6-digit code from a magic link or confirmation email. */
  verifyEmailCode(email: string, code: string): Promise<Session>;
  signOut(): Promise<void>;
}
