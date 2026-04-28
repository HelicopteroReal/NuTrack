/**
 * Custom error types for NuTrack
 * Enables type-safe error handling throughout the app
 */

export enum ErrorCode {
  // Validation errors (422)
  INVALID_INPUT = "INVALID_INPUT",
  INVALID_EMAIL = "INVALID_EMAIL",
  INVALID_PASSWORD = "INVALID_PASSWORD",
  INVALID_QUANTITY = "INVALID_QUANTITY",
  INVALID_DATE = "INVALID_DATE",

  // Authentication errors (401)
  UNAUTHORIZED = "UNAUTHORIZED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  TOKEN_INVALID = "TOKEN_INVALID",

  // Authorization errors (403)
  FORBIDDEN = "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  // Not found errors (404)
  NOT_FOUND = "NOT_FOUND",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  FOOD_NOT_FOUND = "FOOD_NOT_FOUND",
  ENTRY_NOT_FOUND = "ENTRY_NOT_FOUND",

  // Conflict errors (409)
  DUPLICATE_EMAIL = "DUPLICATE_EMAIL",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",

  // Rate limit errors (429)
  RATE_LIMITED = "RATE_LIMITED",
  TOO_MANY_ATTEMPTS = "TOO_MANY_ATTEMPTS",

  // External service errors (502-504)
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",

  // Generic server errors (500)
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  userMessage: string; // User-friendly message
  details?: Record<string, any>;
  requestId?: string; // Correlation ID
  timestamp?: string;
  path?: string;
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public userMessage: string,
    public statusCode: number = 500,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}

// Specific error types for common scenarios
export class ValidationError extends AppError {
  constructor(message: string, userMessage: string = message, details?: Record<string, any>) {
    super(ErrorCode.INVALID_INPUT, message, userMessage, 422, details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Unauthorized", userMessage: string = "Please log in") {
    super(ErrorCode.UNAUTHORIZED, message, userMessage, 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Forbidden", userMessage: string = "You don't have permission to access this") {
    super(ErrorCode.FORBIDDEN, message, userMessage, 403);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(
      ErrorCode.NOT_FOUND,
      `${resource} not found`,
      `The ${resource.toLowerCase()} you're looking for doesn't exist`,
      404,
    );
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, userMessage: string = message) {
    super(ErrorCode.DUPLICATE_EMAIL, message, userMessage, 409);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number = 60) {
    super(
      ErrorCode.RATE_LIMITED,
      `Rate limit exceeded. Retry after ${retryAfter}s`,
      `Too many requests. Please try again in ${retryAfter} seconds.`,
      429,
      { retryAfter },
    );
    this.name = "RateLimitError";
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: Error) {
    super(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      `${service} service error: ${originalError?.message || "Unknown"}`,
      `The ${service} service is temporarily unavailable. Please try again later.`,
      502,
      { service, originalError: originalError?.message },
    );
    this.name = "ExternalServiceError";
  }
}

export class DatabaseError extends AppError {
  constructor(originalError?: Error) {
    super(
      ErrorCode.DATABASE_ERROR,
      `Database error: ${originalError?.message || "Unknown"}`,
      "A database error occurred. Please try again later.",
      500,
      { originalError: originalError?.message },
    );
    this.name = "DatabaseError";
  }
}
