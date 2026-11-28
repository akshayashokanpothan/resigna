'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';
import { getAuthService } from '../services/auth.service';
import { ROUTES } from '@/shared/constants/routes';
import { toast } from '@/shared/utils/toast';
import { Button } from '@/shared/components/Button';
import { Field } from '@/shared/components/Field';
import { Input } from '@/shared/components/Input';
import { safeRedirectPath } from '@/shared/utils/redirect';
import { getAuthErrorMessage } from '../utils/auth-errors';

function getSearchParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

interface LoginFormProps {
  /** Switch to passwordless sign-in. */
  onUseMagicLink?: () => void;
}

export function LoginForm({ onUseMagicLink }: LoginFormProps = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const authService = getAuthService();
      await authService.signInWithEmail(data.email, data.password);
      router.push(safeRedirectPath(getSearchParam('redirectedFrom'), ROUTES.projects));
      router.refresh();
    } catch (error) {
      toast.error(getAuthErrorMessage(error, 'Sign-in failed. Please try again.'), error);
      // Only re-enable the button on failure. On success it stays busy until the next page
      // has loaded, instead of flicking back to idle while the navigation is still running.
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Field id="email" label="Email" error={errors.email?.message}>
        <Input
          type="email"
          size="lg"
          autoComplete="email"
          autoFocus
          placeholder="you@company.com"
          {...register('email')}
        />
      </Field>

      <Field id="password" label="Password" error={errors.password?.message}>
        <Input
          type="password"
          size="lg"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register('password')}
        />
      </Field>

      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={isLoading}
        loadingText="Signing in…"
        className="mt-1"
      >
        Sign in
      </Button>

      {onUseMagicLink && (
        <Button variant="ghost" size="sm" onClick={onUseMagicLink} className="self-center">
          Email me a sign-in link instead
        </Button>
      )}
    </form>
  );
}
