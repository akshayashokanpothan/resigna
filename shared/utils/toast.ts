import { logger } from '@/shared/logger';
import { toast as sonner } from 'sonner';

/**
 * Centralized toast utility.
 * Components NEVER import from 'sonner' directly.
 * All toast calls go through this module.
 *
 * This centralizes future enrichment:
 * - automatic error logging
 * - error code display
 * - analytics tracking
 */

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastPromiseOptions<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: unknown) => string);
}

export const toast = {
  success(message: string, options?: ToastOptions): void {
    sonner.success(message, options);
  },

  error(message: string, error?: unknown, options?: ToastOptions): void {
    if (error) {
      logger.error(message, error);
    }
    sonner.error(message, options);
  },

  info(message: string, options?: ToastOptions): void {
    sonner.info(message, options);
  },

  warning(message: string, options?: ToastOptions): void {
    sonner.warning(message, options);
  },

  promise<T>(promise: Promise<T>, options: ToastPromiseOptions<T>): Promise<T> {
    return sonner.promise(promise, options) as unknown as Promise<T>;
  },

  dismiss(id?: string | number): void {
    sonner.dismiss(id);
  },
};
