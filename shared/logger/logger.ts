import type { LogContext, LogEntry, LoggerAdapter } from './logger.types';

/**
 * Console adapter — used in development.
 * In production, replace with SentryLoggerAdapter.
 * Call-sites remain unchanged (they use the `logger` singleton).
 */
class ConsoleLoggerAdapter implements LoggerAdapter {
  log(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const contextStr = entry.context ? JSON.stringify(entry.context, null, 2) : '';

    switch (entry.level) {
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(prefix, entry.message, contextStr || '');
        }
        break;
      case 'info':
        console.info(prefix, entry.message, contextStr || '');
        break;
      case 'warn':
        console.warn(prefix, entry.message, contextStr || '');
        break;
      case 'error':
        console.error(prefix, entry.message, entry.error ?? '', contextStr || '');
        break;
    }
  }
}

/**
 * Logger singleton.
 *
 * Usage:
 *   import { logger } from '@/shared/logger';
 *   logger.info('Project created', { projectId });
 *   logger.error('Failed to fetch projects', error, { workspaceId });
 *
 * To add Sentry in the future:
 *   Replace `new ConsoleLoggerAdapter()` with `new SentryLoggerAdapter()`
 *   No call-site changes needed.
 */
class Logger {
  private adapter: LoggerAdapter;

  constructor(adapter: LoggerAdapter) {
    this.adapter = adapter;
  }

  private createEntry(
    level: LogEntry['level'],
    message: string,
    error?: unknown,
    context?: LogContext,
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };
  }

  debug(message: string, context?: LogContext): void {
    this.adapter.log(this.createEntry('debug', message, undefined, context));
  }

  info(message: string, context?: LogContext): void {
    this.adapter.log(this.createEntry('info', message, undefined, context));
  }

  warn(message: string, context?: LogContext): void {
    this.adapter.log(this.createEntry('warn', message, undefined, context));
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    this.adapter.log(this.createEntry('error', message, error, context));
  }
}

export const logger = new Logger(new ConsoleLoggerAdapter());
