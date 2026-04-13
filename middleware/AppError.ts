import { HttpStatus } from "../utils/httpStatus";

//Field-level validation error shape
export interface FieldError {
  field: string;
  message: string;
}

//Base AppError 
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string | null;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string | null = null
  ) {
    super(message);

    this.name = this.constructor.name; // "NotFoundError" instead of "Error"
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    // Maintains proper stack trace in V8 (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Required in TS when extending built-ins like Error
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

//Subclasses
export class BadRequestError extends AppError {
  constructor(
    message: string = "Bad request",
    errorCode: string = "BAD_REQUEST"
  ) {
    super(message, HttpStatus.BAD_REQUEST, errorCode);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message: string = "Authentication required",
    errorCode: string = "UNAUTHORIZED"
  ) {
    super(message, HttpStatus.UNAUTHORIZED, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message: string = "Access denied",
    errorCode: string = "FORBIDDEN"
  ) {
    super(message, HttpStatus.FORBIDDEN, errorCode);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    errorCode: string = "NOT_FOUND"
  ) {
    super(message, HttpStatus.NOT_FOUND, errorCode);
  }
}

export class ConflictError extends AppError {
  constructor(
    message: string = "Resource already exists",
    errorCode: string = "CONFLICT"
  ) {
    super(message, HttpStatus.CONFLICT, errorCode);
  }
}

export class ValidationError extends AppError {
  public readonly errors: FieldError[];

  constructor(
    message: string = "Validation failed",
    errors: FieldError[] = [],
    errorCode: string = "VALIDATION_ERROR"
  ) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, errorCode);
    this.errors = errors;
  }
}

export class TooManyRequestsError extends AppError {
  constructor(
    message: string = "Too many requests",
    errorCode: string = "RATE_LIMITED"
  ) {
    super(message, HttpStatus.TOO_MANY_REQUESTS, errorCode);
  }
}

export class InternalServerError extends AppError {
  constructor(
    message: string = "Something went wrong",
    errorCode: string = "INTERNAL_ERROR"
  ) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, errorCode);
  }
}