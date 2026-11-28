'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signupSchema, type SignupInput } from '../schemas/auth.schema';
import { getAuthService } from '../services/auth.service';
import { ROUTES } from '@/shared/constants/routes';
import { toast } from '@/shared/utils/toast';
import { cn } from '@/shared/utils/cn';
import { getAuthErrorMessage } from '../utils/auth-errors';

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckEmail, setIsCheckEmail] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    try {
      const authService = getAuthService();
      const result = await authService.signUp({
        email: data.email,
        password: data.password,
        metadata: { name: data.name },
      });

      if (result.session) {
        // Email confirmation is disabled
        router.push(ROUTES.projects);
        router.refresh();
      } else {
        // Email confirmation is enabled
        setIsCheckEmail(true);
      }
    } catch (error) {
      toast.error(getAuthErrorMessage(error, 'Signup failed. Please try again.'), error);
      // Only re-enable the button on failure. On success it stays busy until the next page
      // has loaded, instead of flicking back to idle while the navigation is still running.
      setIsLoading(false);
    }
  };

  if (isCheckEmail) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-[hsl(var(--foreground))]">Check your email</h3>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            We sent a verification link to your email address.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-[hsl(var(--foreground))]">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          autoFocus
          placeholder="Jane Doe"
          {...register('name')}
          className={cn(
            'h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none transition-colors',
            'border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
            'placeholder:text-[hsl(var(--muted-foreground))]',
            'focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))]',
            errors.name && 'border-[hsl(var(--destructive))]',
          )}
        />
        {errors.name && (
          <p className="text-xs text-[hsl(var(--destructive))]">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-[hsl(var(--foreground))]">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
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
          autoComplete="new-password"
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

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-[hsl(var(--foreground))]"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          className={cn(
            'h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none transition-colors',
            'border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
            'placeholder:text-[hsl(var(--muted-foreground))]',
            'focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))]',
            errors.confirmPassword && 'border-[hsl(var(--destructive))]',
          )}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-[hsl(var(--destructive))]">{errors.confirmPassword.message}</p>
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
        {isLoading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
