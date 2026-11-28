'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { signupSchema, type SignupInput } from '../schemas/auth.schema';
import { getAuthService } from '../services/auth.service';
import { ROUTES } from '@/shared/constants/routes';
import { toast } from '@/shared/utils/toast';
import { MailCheck } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Field } from '@/shared/components/Field';
import { Input } from '@/shared/components/Input';
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
      <div role="status" className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-card border border-accent-border bg-accent-subtle text-accent-text">
          <MailCheck size={22} aria-hidden="true" />
        </div>
        <div>
          <h3 className="type-heading-sm text-fg">Check your email</h3>
          <p className="mt-1 type-body text-fg-secondary">
            We sent a verification link to your email address. Open it to finish creating your
            account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Field id="name" label="Name" error={errors.name?.message}>
        <Input
          size="lg"
          autoComplete="name"
          autoFocus
          placeholder="Ada Lovelace"
          {...register('name')}
        />
      </Field>

      <Field id="email" label="Email" error={errors.email?.message}>
        <Input
          type="email"
          size="lg"
          autoComplete="email"
          placeholder="you@company.com"
          {...register('email')}
        />
      </Field>

      <Field
        id="password"
        label="Password"
        helperText="At least 8 characters."
        error={errors.password?.message}
      >
        <Input
          type="password"
          size="lg"
          autoComplete="new-password"
          placeholder="••••••••"
          {...register('password')}
        />
      </Field>

      <Field id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
        <Input
          type="password"
          size="lg"
          autoComplete="new-password"
          placeholder="••••••••"
          {...register('confirmPassword')}
        />
      </Field>

      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={isLoading}
        loadingText="Creating account…"
        className="mt-1"
      >
        Create account
      </Button>
    </form>
  );
}
