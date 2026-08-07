'use client';

import { ErrorPage } from '@/shared/components/ErrorPage';

/**
 * Next.js App Router error boundary page.
 * Catches rendering errors in the shell and page routes.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      title="Something went wrong"
      description="An unexpected error occurred. Please try refreshing the page."
      showRetry
      onRetry={reset}
    />
  );
}
