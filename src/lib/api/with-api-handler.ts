import "server-only";
import { NextResponse, type NextRequest } from "next/server";

import { checkRateLimit } from "@/lib/api/rate-limit";
import type { RateLimitTier } from "@/lib/api/rate-limit-config";
import { ApiError, RateLimitError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const SLOW_REQUEST_THRESHOLD_MS = 1000;

type Handler<Context> = (request: NextRequest, context: Context) => Promise<NextResponse>;

export interface WithApiHandlerOptions {
  rateLimitTier: RateLimitTier;
}

/**
 * Wraps a Route Handler with the three things every endpoint needs (see
 * docs/api-conventions.md): rate limiting, centralized error → response
 * mapping, and slow-request logging. Business logic only ever throws
 * ApiError subclasses (src/lib/errors) — it never builds an error Response
 * by hand.
 */
export function withApiHandler<Context = unknown>(
  handler: Handler<Context>,
  options: WithApiHandlerOptions,
): Handler<Context> {
  return async (request, context) => {
    const start = Date.now();
    const path = request.nextUrl.pathname;
    const { method } = request;

    try {
      const rateLimit = await checkRateLimit(request, options.rateLimitTier);
      if (!rateLimit.allowed) {
        throw new RateLimitError(rateLimit.retryAfterSeconds);
      }

      const response = await handler(request, context);

      const durationMs = Date.now() - start;
      if (durationMs > SLOW_REQUEST_THRESHOLD_MS) {
        logger.warn({ path, method, durationMs }, "slow_request");
      }

      response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
      return response;
    } catch (error) {
      return toErrorResponse(error, path, method);
    }
  };
}

function toErrorResponse(error: unknown, path: string, method: string): NextResponse {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      logger.error({ err: error, path, method }, "api_error");
    }

    const headers: HeadersInit = {};
    if (error instanceof RateLimitError) {
      headers["Retry-After"] = String(error.retryAfterSeconds);
    }

    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      },
      { status: error.status, headers },
    );
  }

  logger.error({ err: error, path, method }, "unexpected_api_error");
  return NextResponse.json(
    { error: { code: "internal_error", message: "Внутрішня помилка сервера." } },
    { status: 500 },
  );
}
