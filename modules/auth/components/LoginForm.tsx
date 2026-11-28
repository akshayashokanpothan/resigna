'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loginSchema, type LoginInput } from '../schemas/auth.schema';
import { getAuthService } from '../services/auth.service';
import { ROUTES } from '@/shared/constants/routes';
import { toast } from '@/shared/utils/toast';
import { cn } from '@/shared/utils/cn';
import { safeRedirectPath } from '@/shared/utils/redirect';
import { getAuthErrorMessage } from '../utils/auth-errors';

function getSearchParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const errorParam = getSearchParam('error');
    if (errorParam === 'auth_failed' || errorParam === 'oauth_failed') {
      toast.error(
        "Sign-in didn't complete. If you just confirmed your email, sign in below; otherwise please try again.",
      );
    }
  }, []);

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
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[hsl(var(--foreground))]">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@company.com"
          {...register('email')}
          className={cn(
            'h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none transition-colors',
            'border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
            'placeholder:text-[hsl(var(--muted-foreground))]',
            'focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))]',
            errors.email && 'border-[hsl(var(--destructive))]',
          )}
        />
        {errors.email && (
          <p className="text-xs text-[hsl(var(--destructive))]">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-[hsl(var(--foreground))]">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register('password')}
          className={cn(
            'h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none transition-colors',
            'border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
            'placeholder:text-[hsl(var(--muted-foreground))]',
            'focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))]',
            errors.password && 'border-[hsl(var(--destructive))]',
          )}
        />
        {errors.password && (
          <p className="text-xs text-[hsl(var(--destructive))]">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          'mt-1 h-9 w-full rounded-md bg-[hsl(var(--primary))] px-4 text-sm font-medium',
          'text-[hsl(var(--primary-foreground))] transition-opacity',
          'hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          'focus-visible:outline-[hsl(var(--primary))] disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        {isLoading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
