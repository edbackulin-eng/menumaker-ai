import "server-only";
import { NextResponse, type NextRequest } from "next/server";

import { DEMO_MODE_MESSAGE, isDemoMode } from "@/config/demo";
import { checkRateLimit } from "@/lib/api/rate-limit";
import type { RateLimitTier } from "@/lib/api/rate-limit-config";
import { ApiError, RateLimitError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const HEAVY_METHODS = new Set(["POST", "PATCH", "DELETE", "PUT"]);

/**
 * Демо-заслон №1 (покриває всі роути, обгорнуті `withApiHandler`). У демо-режимі
 * блокуємо будь-яку «важку» точку — на бекенді, до звернення до сервісів/ключів:
 *   • будь-яка мутація (POST/PATCH/DELETE/PUT);
 *   • будь-який AI- або export-роут (tier `ai` / `export`);
 *   • будь-який адмін-роут (`/api/admin/**`) — навіть read-only GET.
 * Живими лишаються тільки read-only GET-и не-адмінських роутів (tier
 * `authenticated`): `menus` GET, `menus/[id]` GET, `dashboard/summary` GET —
 * саме те, що потрібно, щоб демо показало готовий приклад меню й інтерфейс.
 */
function isBlockedInDemo(pathname: string, method: string, tier: RateLimitTier): boolean {
  return (
    pathname.startsWith("/api/admin") ||
    HEAVY_METHODS.has(method) ||
    tier === "ai" ||
    tier === "export"
  );
}

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

    // Демо-заслон — найпершим, до rate-limit і будь-якого звернення до
    // сервісів/ключів (принцип: заслоном є прапорець, а не порожні ключі).
    if (isDemoMode && isBlockedInDemo(path, method, options.rateLimitTier)) {
      return NextResponse.json(
        { error: { code: "demo_mode", message: DEMO_MODE_MESSAGE } },
        { status: 403 },
      );
    }

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
