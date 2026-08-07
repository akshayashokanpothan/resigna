export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: unknown;
}

/**
 * Logger adapter interface.
 * Swap ConsoleLoggerAdapter for SentryLoggerAdapter with zero call-site changes.
 */
export interface LoggerAdapter {
  log(entry: LogEntry): void;
}
