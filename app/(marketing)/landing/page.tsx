import type { Metadata } from 'next';
import { APP_DISPLAY_NAME, APP_NAME, APP_TAGLINE, APP_URL } from '@/shared/constants/app.constants';
import { ROUTES } from '@/shared/constants/routes';
import { buttonVariants } from '@/shared/components/Button';
import { Logo } from '@/shared/components/Logo';
import { cn } from '@/shared/utils/cn';

export const metadata: Metadata = {
  title: { absolute: `${APP_DISPLAY_NAME}: ${APP_TAGLINE}` },
};

/**
 * Public landing page. On the landing host it is served at `/` (see proxy.ts);
 * the app itself lives on NEXT_PUBLIC_APP_URL, so links here are absolute.
 */
export default function LandingPage() {
  const signInUrl = new URL(ROUTES.login, APP_URL).href;
  const signUpUrl = new URL(ROUTES.signup, APP_URL).href;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-canvas text-fg">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/brand/patterns/research-grid-pattern.svg')] bg-[length:1200px_800px] bg-top opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_65%)]"
      />
      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <Logo height={24} />
        <a href={signInUrl} className={buttonVariants({ variant: 'ghost' })}>
          Sign in
        </a>
      </header>

      <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{APP_TAGLINE}</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-fg-secondary">
          Bring interviews and notes into one place, organise them into evidence, and turn that
          evidence into affinity maps, personas, journey maps and How Might We statements, with
          every insight traced back to what participants said.
        </p>
        <div className="mt-8 flex gap-3">
          <a href={signUpUrl} className={buttonVariants({ size: 'lg' })}>
            Get started
          </a>
          <a href={signInUrl} className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }))}>
            Sign in
          </a>
        </div>
      </main>

      <footer className="relative mx-auto w-full max-w-5xl px-6 py-6 type-caption text-fg-secondary">
        © {new Date().getFullYear()} {APP_NAME}
      </footer>
    </div>
  );
}
