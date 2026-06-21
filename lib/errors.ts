export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

export class InsufficientCreditsError extends AppError {
  constructor(message = "Insufficient credits") {
    super(message, 402);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 400);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return { message: error.message, statusCode: error.statusCode };
  }
  console.error("Unexpected error:", error);
  return { message: "Internal server error", statusCode: 500 };
}
