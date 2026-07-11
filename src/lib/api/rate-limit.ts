import "server-only";
import type { NextRequest } from "next/server";

import { getClientIp } from "@/lib/api/client-ip";
import { API_RATE_LIMITS, type RateLimitTier } from "@/lib/api/rate-limit-config";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * `authenticated` tier keys by user id when a session exists, falling back
 * to IP for signed-out requests (e.g. hitting an authenticated-tier route
 * without a session — requireAuth() inside the handler still rejects it
 * with 401; this only decides *which counter* absorbs the request).
 */
async function getRateLimitKey(request: NextRequest, tier: RateLimitTier): Promise<string> {
  if (tier === "public") {
    return `api:ip:${getClientIp(request)}`;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? `api:user:${user.id}` : `api:ip:${getClientIp(request)}`;
}

export async function checkRateLimit(
  request: NextRequest,
  tier: RateLimitTier,
): Promise<RateLimitResult> {
  const key = await getRateLimitKey(request, tier);
  const config = API_RATE_LIMITS[tier];

  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_limit: config.limit,
    p_window_seconds: config.windowSeconds,
  });

  if (error) {
    // Fail open: a broken rate limiter must not take the whole API down.
    logger.error({ err: error, key }, "rate_limit_check_failed");
    return { allowed: true, remaining: config.limit, retryAfterSeconds: 0 };
  }

  const row = data?.[0];
  if (!row) {
    return { allowed: true, remaining: config.limit, retryAfterSeconds: 0 };
  }

  if (!row.allowed) {
    logger.warn({ key, tier, path: request.nextUrl.pathname }, "rate_limit_exceeded");
  }

  return {
    allowed: row.allowed,
    remaining: row.remaining,
    retryAfterSeconds: row.retry_after_seconds,
  };
}
