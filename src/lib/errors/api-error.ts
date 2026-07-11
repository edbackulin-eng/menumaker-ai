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

/** Thrown by src/services/ai/credit-guard.ts when a user's balance can't cover an AI call's cost. */
export class InsufficientCreditsError extends ApiError {
  constructor(message = "Недостатньо кредитів для цієї дії.") {
    super(402, "insufficient_credits", message);
    this.name = "InsufficientCreditsError";
  }
}

/**
 * The AI provider itself failed (network error, timeout, upstream rate
 * limit, 5xx from Anthropic). 502 — this server acted correctly, an
 * upstream dependency didn't. `retryable` is informational only right now
 * (surfaced in logs); callers don't yet act on it.
 */
export class AIProviderError extends ApiError {
  constructor(
    message = "AI-провайдер тимчасово недоступний.",
    public readonly retryable = false,
  ) {
    super(502, "ai_provider_error", message);
    this.name = "AIProviderError";
  }
}

/**
 * The AI provider responded successfully, but its output still didn't
 * match the expected zod schema after one retry with a clarified prompt.
 * Also 502: from the client's perspective this is the same class of
 * problem as AIProviderError (upstream dependency misbehaved), not a
 * client input error.
 */
export class AIOutputValidationError extends ApiError {
  constructor(detail?: string) {
    super(
      502,
      "ai_output_invalid",
      "AI повернув некоректну відповідь після повторної спроби.",
      detail ? { _root: [detail] } : undefined,
    );
    this.name = "AIOutputValidationError";
  }
}
