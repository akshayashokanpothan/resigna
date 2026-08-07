import { AppError } from '../errors/AppError';
import { ErrorCode } from '../errors/error-codes';

/**
 * Asserts a condition is truthy, throwing an AppError if false.
 * Useful for narrowing types and validating invariants.
 */
export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new AppError({
      message,
      code: ErrorCode.VALIDATION_FAILED,
    });
  }
}

/**
 * Asserts a value is defined (not null and not undefined).
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message = 'Value must be defined',
): asserts value is T {
  if (value === null || value === undefined) {
    throw new AppError({
      message,
      code: ErrorCode.VALIDATION_FAILED,
    });
  }
}
