'use client';

import { Toaster } from 'sonner';

/**
 * Sonner toast provider, themed with Resigna tokens.
 * Toasts are for short-lived confirmation after an action; for persistent, in-page feedback
 * use <Notification>. All toast calls go through shared/utils/toast.ts — never import sonner directly.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        theme="dark"
        position="bottom-right"
        gap={8}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              'relative flex w-[356px] items-start gap-3 rounded-control border border-border bg-surface-raised px-4 py-3 shadow-overlay font-sans',
            title: 'text-sm font-semibold text-fg',
            description: 'mt-0.5 type-body-sm text-fg-secondary',
            icon: 'mt-0.5 [&_svg]:size-4',
            success: '[&_[data-icon]]:text-success-text',
            error: '[&_[data-icon]]:text-danger-text',
            warning: '[&_[data-icon]]:text-warning-text',
            info: '[&_[data-icon]]:text-info-text',
            actionButton:
              'ml-auto h-7 shrink-0 rounded-control bg-accent px-2.5 text-xs font-medium text-on-accent hover:bg-accent-hover',
            cancelButton:
              'h-7 shrink-0 rounded-control border border-border-strong px-2.5 text-xs font-medium text-fg hover:bg-layer-hover',
            content: 'min-w-0 flex-1',
            closeButton:
              'order-last -mr-1 inline-flex size-6 shrink-0 items-center justify-center rounded-sm border-0 !bg-transparent text-fg-secondary transition-colors hover:!bg-layer-hover hover:text-fg focus-ring',
          },
        }}
        closeButton
      />
    </>
  );
}
