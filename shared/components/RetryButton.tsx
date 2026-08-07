import { cn } from '@/shared/utils/cn';

interface RetryButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function RetryButton({ onClick, label = 'Try again', className }: RetryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-8 rounded-md border border-[hsl(var(--border))] px-4 text-sm',
        'text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-[hsl(var(--primary))]',
        className,
      )}
    >
      {label}
    </button>
  );
}
