import type { ZodError } from "zod";

/**
 * Base class for every error a Route Handler is allowed to throw.
 * `withApiHandler` (src/lib/api/with-api-handler.ts) catches these and
 * serializes them into the standard `{ error }` envelope — see
 * docs/api-conventions.md. Business logic should never build an error
 * Response by hand; throw one of these (or a subclass) instead.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function zodErrorToDetails(error: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_root";
    (details[key] ??= []).push(issue.message);
  }
  return details;
}

export class ValidationError extends ApiError {
  constructor(zodError: ZodError) {
    super(422, "validation_error", "Помилка валідації.", zodErrorToDetails(zodError));
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Потрібна автентифікація.") {
    super(401, "unauthorized", message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Недостатньо прав для цієї дії.") {
    super(403, "forbidden", message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Ресурс не знайдено.") {
    super(404, "not_found", message);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends ApiError {
  constructor(public readonly retryAfterSeconds: number) {
    super(429, "rate_limited", "Забагато запитів. Спробуйте пізніше.");
    this.name = "RateLimitError";
  }
}

/** Reserved for the AI/Menu Generator/Payments stages — not wired to any logic yet. */
export class InsufficientCreditsError extends ApiError {
  constructor(message = "Недостатньо кредитів для цієї дії.") {
    super(402, "insufficient_credits", message);
    this.name = "InsufficientCreditsError";
  }
}
