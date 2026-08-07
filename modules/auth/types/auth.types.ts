export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Session {
  user: AuthUser;
  accessToken: string;
  expiresAt: number;
}

export type OAuthProvider = 'google' | 'github';

export interface SignUpCredentials {
  email: string;
  password: string;
  metadata?: Record<string, unknown>;
}

export interface SignUpResult {
  user: AuthUser | null;
  session: Session | null;
}
