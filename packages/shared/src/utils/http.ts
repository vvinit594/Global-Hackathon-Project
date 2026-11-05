import type { ApiResponse, ApiErrorPayload } from '../types/api';

/**
 * Creates a standardized success API response payload.
 */
export function createSuccessResponse<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  if (meta) {
    response.meta = meta;
  }
  return response;
}

/**
 * Creates a standardized error API response payload.
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown,
  requestId?: string
): ApiResponse<never> {
  const error: ApiErrorPayload = {
    code,
    message,
    timestamp: new Date().toISOString(),
  };

  if (details !== undefined) {
    error.details = details;
  }

  if (requestId) {
    error.requestId = requestId;
  }

  return {
    success: false,
    error,
  };
}
