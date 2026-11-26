# modules/auth

**Status:** Built (Sprint 0).

## Purpose

Email/password and OAuth (Google, GitHub) sign-in, sign-up, session access and sign-out.

## Public API (`index.ts`)

- Types: `AuthUser`, `Session`, `OAuthProvider`, `AuthRepository`
- Services: `getAuthService()`
- Hooks: `useSession`, `useCurrentUser`, `useSignOut`
- Components: `AuthCard`, `LoginForm`, `SignupForm`, `OAuthButtons`

## Constraints

- `repositories/supabase-auth.repository.ts` is the only file that calls Supabase auth APIs.
- Route protection lives in the root `proxy.ts` (Next 16 name for middleware); the OAuth callback is `app/api/auth/callback`.
- A default workspace is created by the `handle_new_user` database trigger, not by app code.
