import { cn } from '@/shared/utils/cn';
import { Illustration, type IllustrationName } from './Illustration';
import { RetryButton } from './RetryButton';

interface ErrorPageProps {
  title: string;
  /** Say what happened and what the person can do about it. */
  description: string;
  illustration?: IllustrationName;
  error?: Error | null;
  showRetry?: boolean;
  onRetry?: () => void;
  /** Extra actions, e.g. a link back to Projects. */
  action?: React.ReactNode;
  className?: string;
}

export function ErrorPage({
  title,
  description,
  illustration = 'error-500',
  showRetry,
  onRetry,
  action,
  className,
}: ErrorPageProps) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center',
        className,
      )}
      role="alert"
    >
      <Illustration name={illustration} width={200} />
      <div className="max-w-sm">
        <h2 className="mb-1 type-heading-sm text-fg">{title}</h2>
        <p className="type-body text-fg-secondary">{description}</p>
      </div>
      {(showRetry || action) && (
        <div className="flex items-center gap-2">
          {showRetry && onRetry && <RetryButton onClick={onRetry} />}
          {action}
        </div>
      )}
    </div>
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorPage
      illustration="network-error"
      title="Connection error"
      description="Unable to reach the server. Check your internet connection and try again."
      showRetry
      onRetry={onRetry}
    />
  );
}

export function Unauthorized() {
  return (
    <ErrorPage
      illustration="permission-denied"
      title="Access denied"
      description="You don't have permission to view this page. Ask a workspace owner for access."
    />
  );
}

export function NotFound({
  resource = 'Page',
  action,
}: {
  resource?: string;
  action?: React.ReactNode;
}) {
  return (
    <ErrorPage
      illustration="error-404"
      title={`${resource} not found`}
      description="It may have moved, been deleted, or the link is wrong."
      action={action}
    />
  );
}
