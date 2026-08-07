'use client';

import { Toaster } from 'sonner';

/**
 * Sonner toast provider with Resigna theme config.
 * All toast calls go through shared/utils/toast.ts — never import sonner directly.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              'bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] shadow-lg text-sm',
            description: 'text-[hsl(var(--muted-foreground))]',
            actionButton: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
            cancelButton: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
          },
        }}
        closeButton
      />
    </>
  );
}
