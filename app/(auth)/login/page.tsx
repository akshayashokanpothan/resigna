import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm, OAuthButtons, AuthCard } from '@/modules/auth';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default function LoginPage() {
  return (
    <div className="w-full">
      <AuthCard title="Sign in" description="Welcome back. Sign in to continue.">
        <OAuthButtons />

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" aria-hidden="true" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-surface px-3 type-caption text-fg-secondary">or</span>
          </div>
        </div>

        <LoginForm />
      </AuthCard>

      <div className="mt-4 text-center">
        <p className="text-sm text-fg-secondary">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="rounded-xs font-medium text-accent-text underline-offset-4 hover:underline focus-ring"
          >
            Sign up
          </Link>
        </p>
      </div>

      <p className="mt-4 text-center type-caption text-fg-secondary">
        By signing in, you agree to our{' '}
        <span className="underline underline-offset-2">Terms of Service</span> and{' '}
        <span className="underline underline-offset-2">Privacy Policy</span>.
      </p>
    </div>
  );
}
