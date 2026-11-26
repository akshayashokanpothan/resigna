// modules/auth/index.ts — Public API
export type { AuthUser, Session, OAuthProvider } from './types/auth.types';
export type { AuthRepository } from './repositories/auth.repository';
export { getAuthService } from './services/auth.service';
export { useSession, useCurrentUser } from './hooks/use-session';
export { useSignOut } from './hooks/use-sign-out';
export { AuthCard } from './components/AuthCard';
export { LoginForm } from './components/LoginForm';
export { SignupForm } from './components/SignupForm';
export { OAuthButtons } from './components/OAuthButtons';
