import { cn } from '@/shared/utils/cn';

/** Keyboard key or shortcut, e.g. <Kbd>⌘K</Kbd>. IBM Plex Mono. */
export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-border',
        'bg-canvas px-1 font-mono text-2xs text-fg-secondary',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
