import { ZodError } from 'zod';
import { createErrorResponse } from '../utils/http';
import type { ApiResponse } from '../types/api';

// ─── Base Application Error ───────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    details?: unknown,
    isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Common HTTP Error Subclasses ─────────────────────────────────────────────

export class ValidationError extends AppError {
  constructor(message = 'Invalid request data', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', details?: unknown) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', details?: unknown) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: unknown) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details?: unknown) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later', details?: unknown) {
    super(message, 429, 'RATE_LIMITED', details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', details?: unknown) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details, false);
  }
}

export class BlockchainError extends AppError {
  constructor(message = 'Blockchain interaction failed', details?: unknown) {
    super(message, 502, 'BLOCKCHAIN_ERROR', details);
  }
}

// ─── Error Normalizer ─────────────────────────────────────────────────────────

export interface NormalizedErrorResult {
  statusCode: number;
  response: ApiResponse<never>;
}

/**
 * Normalizes any error (Zod, AppError, generic Error, or unknown) into a structured API response.
 */
export function normalizeError(error: unknown, requestId?: string): NormalizedErrorResult {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      response: createErrorResponse(error.code, error.message, error.details, requestId),
    };
  }

  if (error instanceof ZodError) {
    const formatted = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return {
      statusCode: 400,
      response: createErrorResponse(
        'VALIDATION_ERROR',
        'Request validation failed',
        formatted,
        requestId
      ),
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      response: createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : error.message,
        undefined,
        requestId
      ),
    };
  }

  return {
    statusCode: 500,
    response: createErrorResponse(
      'UNKNOWN_ERROR',
      'An unexpected unknown error occurred',
      undefined,
      requestId
    ),
  };
}
