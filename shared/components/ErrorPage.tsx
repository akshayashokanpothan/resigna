import { cn } from '@/shared/utils/cn';
import { RetryButton } from './RetryButton';

interface ErrorPageProps {
  title: string;
  description: string;
  error?: Error | null;
  showRetry?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function ErrorPage({ title, description, showRetry, onRetry, className }: ErrorPageProps) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[400px] flex-col items-center justify-center gap-4 p-8',
        className,
      )}
      role="alert"
    >
      <div className="text-center max-w-sm">
        <h2 className="text-base font-semibold text-[hsl(var(--foreground))] mb-2">{title}</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{description}</p>
      </div>
      {showRetry && onRetry && <RetryButton onClick={onRetry} />}
    </div>
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorPage
      title="Connection error"
      description="Unable to reach the server. Check your internet connection and try again."
      showRetry
      onRetry={onRetry}
    />
  );
}

export function Unauthorized() {
  return (
    <ErrorPage title="Access denied" description="You don't have permission to view this page." />
  );
}

export function NotFound({ resource = 'Page' }: { resource?: string }) {
  return (
    <ErrorPage
      title={`${resource} not found`}
      description="The page you're looking for doesn't exist or has been moved."
    />
  );
}
