import { ErrorCode } from './error-codes';

interface AppErrorOptions {
  code: ErrorCode;
  message: string;
  statusCode?: number;
  cause?: unknown;
  context?: Record<string, unknown>;
}

/**
 * Base error class for all application errors.
 * Every thrown error in the application must extend AppError.
 * This enables structured logging, error code tracking, and consistent UI error states.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly context?: Record<string, unknown>;

  constructor({ code, message, statusCode = 500, cause, context }: AppErrorOptions) {
    super(message, { cause });
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;

    // Maintains proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
    };
  }
}

/**
 * Narrow an unknown thrown value to AppError.
 * Use in catch blocks to ensure structured error handling.
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof Error) {
    return new AppError({
      code: ErrorCode.UNKNOWN,
      message: error.message,
      cause: error,
      statusCode: 500,
    });
  }
  return new AppError({
    code: ErrorCode.UNKNOWN,
    message: 'An unknown error occurred',
    context: { raw: String(error) },
    statusCode: 500,
  });
}
