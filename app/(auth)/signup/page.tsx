import type { Metadata } from 'next';
import Link from 'next/link';
import { SignupForm, OAuthButtons, AuthCard } from '@/modules/auth';

export const metadata: Metadata = {
  title: 'Create an account',
};

export default function SignupPage() {
  return (
    <div className="w-full">
      <AuthCard title="Create an account" description="Sign up to get started.">
        <OAuthButtons />

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" aria-hidden="true" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-surface px-3 type-caption text-fg-secondary">or</span>
          </div>
        </div>

        <SignupForm />
      </AuthCard>

      <div className="mt-4 text-center">
        <p className="text-sm text-fg-secondary">
          Already have an account?{' '}
          <Link
            href="/login"
            className="rounded-xs font-medium text-accent-text underline-offset-4 hover:underline focus-ring"
          >
            Sign in
          </Link>
        </p>
      </div>

      <p className="mt-4 text-center type-caption text-fg-secondary">
        By signing up, you agree to our{' '}
        <span className="underline underline-offset-2">Terms of Service</span> and{' '}
        <span className="underline underline-offset-2">Privacy Policy</span>.
      </p>
    </div>
  );
}
