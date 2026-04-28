/**
 * Unified API error handler
 * Converts all errors to consistent response format with correlation ID
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ErrorCode,
} from "@/lib/errors";
import { logger, getCorrelationId } from "@/lib/logger";

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    userMessage: string;
    details?: Record<string, any>;
  };
  requestId: string;
  timestamp: string;
}

/**
 * Handle API errors and return standardized response
 */
export function handleApiError(error: unknown, request: NextRequest): NextResponse<ApiErrorResponse> {
  const correlationId = getCorrelationId(request);
  const timestamp = new Date().toISOString();

  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof SyntaxError && error.message.includes("JSON")) {
    appError = new ValidationError(
      "Invalid JSON in request body",
      "The request body is not valid JSON",
    );
  } else if (error instanceof Error) {
    // Log unexpected errors
    logger.error(`Unexpected error: ${error.message}`, {
      correlationId,
      errorType: error.constructor.name,
    }, error);

    appError = new AppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      error.message,
      "An unexpected error occurred. Please try again later.",
      500,
      { originalError: error.message },
    );
  } else {
    logger.error("Unknown error type", { correlationId, error });

    appError = new AppError(
      ErrorCode.UNKNOWN_ERROR,
      "Unknown error",
      "An unknown error occurred. Please try again later.",
      500,
    );
  }

  // Log the error
  logger.error(appError.message, {
    correlationId,
    code: appError.code,
    statusCode: appError.statusCode,
  });

  // Return standardized response
  const response: ApiErrorResponse = {
    error: {
      code: appError.code,
      message: appError.message,
      userMessage: appError.userMessage,
      ...(appError.details && { details: appError.details }),
    },
    requestId: correlationId,
    timestamp,
  };

  return NextResponse.json(response, { status: appError.statusCode });
}

/**
 * Wrapper for API route handlers with automatic error catching
 */
export function createApiHandler(
  handler: (
    request: NextRequest,
    context: { params?: Record<string, string> },
  ) => Promise<NextResponse | Response>,
) {
  return async (request: NextRequest, context: { params?: Record<string, string> }) => {
    const correlationId = getCorrelationId(request);
    const startTime = Date.now();

    try {
      const response = await handler(request, context);
      const duration = Date.now() - startTime;

      logger.info("API request successful", {
        correlationId,
        method: request.method,
        path: request.nextUrl.pathname,
        statusCode: response.status,
        duration,
      });

      // Add correlation ID to response headers
      const newResponse = new NextResponse(response.body, response);
      newResponse.headers.set("x-correlation-id", correlationId);
      return newResponse;
    } catch (error) {
      return handleApiError(error, request);
    }
  };
}
