import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError, FieldError } from "./AppError";
import { HttpStatus } from "../utils/httpStatus";

//Types
interface NormalizedError {
  statusCode: number;
  message: string;
  errorCode: string;
  errors?: FieldError[];
}

interface ErrorResponseExtras {
  errors?: FieldError[];
  stack?: string;
}

interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errorCode: string;
  errors?: FieldError[];
  stack?: string;
  timestamp: string;
}

// Mongoose duplicate key error shape
interface MongooseDuplicateKeyError extends Error {
  code: number;
  keyValue: Record<string, unknown>;
}

// Mongoose field validation error shape
interface MongooseFieldError {
  path: string;
  message: string;
}

interface MongooseValidationError extends Error {
  name: "ValidationError";
  errors: Record<string, MongooseFieldError>;
}

// Multer error shape
interface MulterError extends Error {
  code: string;
}

// Union of all recognizable third-party errors
type KnownThirdPartyError =
  | MongooseDuplicateKeyError
  | MongooseValidationError
  | MulterError
  | Error; // JWT errors matched by name


//Helpers
/**
 * Formats third-party library errors into our AppError shape.
 * Returns null if the error is not recognized.
 */
const normalizeError = (err: KnownThirdPartyError): NormalizedError | null => {
  // Mongoose duplicate key (code 11000)
  if ("code" in err && (err as MongooseDuplicateKeyError).code === 11000) {
    const mongoErr = err as MongooseDuplicateKeyError;
    const field = Object.keys(mongoErr.keyValue ?? {})[0] ?? "field";
    return {
      statusCode: HttpStatus.CONFLICT,
      message: `${field} already exists`,
      errorCode: "DUPLICATE_KEY",
    };
  }

  // Mongoose validation error
  if (err.name === "ValidationError" && "errors" in err) {
    const mongoErr = err as MongooseValidationError;
    const errors: FieldError[] = Object.values(mongoErr.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return {
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: "Validation failed",
      errorCode: "VALIDATION_ERROR",
      errors,
    };
  }

  // JWT errors (matched by name — no separate package types needed)
  if (err.name === "JsonWebTokenError") {
    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      message: "Invalid token",
      errorCode: "INVALID_TOKEN",
    };
  }
  if (err.name === "TokenExpiredError") {
    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      message: "Token expired",
      errorCode: "TOKEN_EXPIRED",
    };
  }

  // Multer file size error
  if ("code" in err && (err as MulterError).code === "LIMIT_FILE_SIZE") {
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: "File too large",
      errorCode: "FILE_TOO_LARGE",
    };
  }

  return null;
};

/**
 * Builds the structured error response body.
 */
const buildErrorResponse = (
  statusCode: number,
  message: string,
  errorCode: string,
  extras: ErrorResponseExtras = {}
): ErrorResponse => ({
  success: false,
  statusCode,
  message,
  errorCode,
  ...extras,
  timestamp: new Date().toISOString(),
});

// Middleware

/**
 * Global error handler — must be the LAST middleware registered in app.ts.
 * Express identifies it as an error handler because it has 4 parameters.
*
 * Usage:
 *   app.use(errorHandler);
 */
const errorHandler = (
  err: Error,           // always type as base Error — narrow inside
  req: Request,
  res: Response,
  _next: NextFunction   // prefix with — required by Express but never called
): void => {
  const appErr = err as AppError;

  // Log every error (swap with winston/pino in production)
  const logLevel: "error" | "warn" = appErr.statusCode >= 500 ? "error" : "warn";
  console[logLevel]({
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
    statusCode: appErr.statusCode,
    errorCode: appErr.errorCode,
  });

  // 1. Known operational errors (our AppError subclasses)
  if (appErr.isOperational) {
    const extras: ErrorResponseExtras = {};
    if (err instanceof ValidationError && err.errors?.length) {
      extras.errors = err.errors;
    }
    res
      .status(appErr.statusCode)
      .json(buildErrorResponse(appErr.statusCode, err.message, appErr.errorCode ?? "ERROR", extras));
    return;
  }

  // 2. Known third-party errors (Mongoose, JWT, Multer)
  const normalized = normalizeError(err as KnownThirdPartyError);
  if (normalized) {
    const { statusCode, message, errorCode, errors } = normalized;
    res
      .status(statusCode)
      .json(buildErrorResponse(statusCode, message, errorCode, errors ? { errors } : {}));
    return;
  }

  // 3. Unknown / programming errors — never leak internals in production
  const isProd = process.env.NODE_ENV === "production";
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
    buildErrorResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      isProd ? "Something went wrong. Please try again later." : err.message,
      "INTERNAL_ERROR",
      isProd ? {} : { stack: err.stack }
    )
  );
};

/**
 * 404 handler — register BEFORE errorHandler, AFTER all routes.
 *
 * Usage:
 *   app.use(notFoundHandler);
 *   app.use(errorHandler);
 */

const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} not found`,
      HttpStatus.NOT_FOUND,
      "ROUTE_NOT_FOUND"
    )
  );
};

export { errorHandler, notFoundHandler };