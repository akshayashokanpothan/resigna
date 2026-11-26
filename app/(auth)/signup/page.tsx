import type { Metadata } from 'next';
import Link from 'next/link';
import { SignupForm, OAuthButtons, AuthCard } from '@/modules/auth';

export const metadata: Metadata = {
  title: 'Create an account',
};

export default function SignupPage() {
  return (
    <div className="w-full max-w-sm">
      <AuthCard title="Create an account" description="Sign up to get started.">
        <OAuthButtons />

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[hsl(var(--border))]" aria-hidden="true" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[hsl(var(--card))] px-2 text-xs text-[hsl(var(--muted-foreground))]">
              or
            </span>
          </div>
        </div>

        <SignupForm />
      </AuthCard>

      <div className="mt-4 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-[hsl(var(--primary))] hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-[hsl(var(--muted-foreground))]">
        By signing up, you agree to our{' '}
        <span className="underline underline-offset-2">Terms of Service</span> and{' '}
        <span className="underline underline-offset-2">Privacy Policy</span>.
      </p>
    </div>
  );
}
