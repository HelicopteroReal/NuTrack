/**
 * Structured logging system for production debugging
 * Includes correlation IDs for tracing requests across services
 */

import { NextRequest } from "next/server";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  level: LogLevel;
  timestamp: string;
  requestId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  message: string;
  data?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
  duration?: number;
}

/**
 * Get or create correlation ID from request headers
 */
export function getCorrelationId(request?: NextRequest): string {
  if (!request) return generateCorrelationId();

  // Check for existing correlation ID in headers
  const existing = request.headers.get("x-correlation-id") ||
                   request.headers.get("x-request-id") ||
                   request.headers.get("traceparent");

  return existing || generateCorrelationId();
}

/**
 * Generate unique correlation ID (v4 UUID format)
 */
export function generateCorrelationId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Main logger instance
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  log(
    level: LogLevel,
    message: string,
    data?: Record<string, any>,
    error?: Error,
  ): void {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      data,
      ...(error && {
        error: {
          code: error.name,
          message: error.message,
          stack: this.isDevelopment ? error.stack : undefined,
        },
      }),
    };

    // In production, send to external logging service (e.g., Sentry, DataDog)
    // For now, log to stdout
    console.log(JSON.stringify(entry));
  }

  debug(message: string, data?: Record<string, any>): void {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, data);
    }
  }

  info(message: string, data?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.WARN, message, data, error);
  }

  error(message: string, data?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, data, error);
  }
}

export const logger = new Logger();

/**
 * Request logging middleware
 * Logs request start, end, and duration
 */
export function createRequestLogger(request: NextRequest) {
  const correlationId = getCorrelationId(request);
  const startTime = Date.now();
  const method = request.method;
  const pathname = request.nextUrl.pathname;

  return {
    correlationId,
    logStart: () => {
      logger.info("Request started", {
        correlationId,
        method,
        pathname,
      });
    },
    logSuccess: (statusCode: number) => {
      const duration = Date.now() - startTime;
      logger.info("Request completed", {
        correlationId,
        method,
        pathname,
        statusCode,
        duration,
      });
    },
    logError: (statusCode: number, error: Error) => {
      const duration = Date.now() - startTime;
      logger.error("Request failed", {
        correlationId,
        method,
        pathname,
        statusCode,
        duration,
      }, error);
    },
  };
}

// Export singleton for use in components/hooks
export const useLogger = () => logger;
