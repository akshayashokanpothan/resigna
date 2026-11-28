import type { Metadata } from 'next';
import { APP_NAME, APP_TAGLINE, APP_URL } from '@/shared/constants/app.constants';
import { ROUTES } from '@/shared/constants/routes';

export const metadata: Metadata = {
  title: { absolute: `${APP_NAME}: ${APP_TAGLINE}` },
};

/**
 * Public landing page. On the landing host it is served at `/` (see proxy.ts);
 * the app itself lives on NEXT_PUBLIC_APP_URL, so links here are absolute.
 */
export default function LandingPage() {
  const signInUrl = new URL(ROUTES.login, APP_URL).href;
  const signUpUrl = new URL(ROUTES.signup, APP_URL).href;

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">{APP_NAME}</span>
        <a
          href={signInUrl}
          className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
        >
          Sign in
        </a>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{APP_TAGLINE}</h1>
        <p className="mt-5 max-w-xl text-base text-[hsl(var(--muted-foreground))]">
          Bring interviews and notes into one place, organise them into evidence, and turn that
          evidence into affinity maps, personas, journey maps and How Might We statements, with
          every insight traced back to what participants said.
        </p>
        <div className="mt-8 flex gap-3">
          <a
            href={signUpUrl}
            className="rounded-md bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
          >
            Get started
          </a>
          <a
            href={signInUrl}
            className="rounded-md border border-[hsl(var(--border))] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[hsl(var(--accent))]"
          >
            Sign in
          </a>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-6 py-6 text-xs text-[hsl(var(--muted-foreground))]">
        © {new Date().getFullYear()} {APP_NAME}
      </footer>
    </div>
  );
}
