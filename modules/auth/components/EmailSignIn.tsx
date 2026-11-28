'use client';

import { useEffect, useState } from 'react';
import { LoginForm } from './LoginForm';
import { MagicLinkForm } from './MagicLinkForm';
import { toast } from '@/shared/utils/toast';

const LINK_ERROR_MESSAGES: Record<string, string> = {
  link_expired:
    'That sign-in link has expired or was already used. Enter your email to get a new one.',
  auth_failed:
    "Sign-in didn't complete. If you just confirmed your email, sign in below; otherwise please try again.",
  oauth_failed:
    "Sign-in didn't complete. If you just confirmed your email, sign in below; otherwise please try again.",
};

/** Email sign-in on the login page: password, or a one-time link and code. */
interface EmailSignInProps {
  /** Start on the magic link form, e.g. after an expired link. */
  initialMode?: 'password' | 'magic';
}

export function EmailSignIn({ initialMode = 'password' }: EmailSignInProps) {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get('error');
    const message = error ? LINK_ERROR_MESSAGES[error] : undefined;
    if (!message) return;
    toast.error(message);
  }, []);

  return mode === 'magic' ? (
    <MagicLinkForm onUsePassword={() => setMode('password')} />
  ) : (
    <LoginForm onUseMagicLink={() => setMode('magic')} />
  );
}
