import { AppError } from './AppError';
import { ErrorCode } from './error-codes';

export class AuthError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.UNAUTHORIZED, cause?: unknown) {
    super({ code, message, statusCode: 401, cause });
    this.name = 'AuthError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'A network error occurred', cause?: unknown) {
    super({ code: ErrorCode.NETWORK_FAILURE, message, statusCode: 503, cause });
    this.name = 'NetworkError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super({
      code: ErrorCode.NOT_FOUND,
      message: `${resource} not found`,
      statusCode: 404,
    });
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({
      code: ErrorCode.VALIDATION_FAILED,
      message,
      statusCode: 400,
      context,
    });
    this.name = 'ValidationError';
  }
}
