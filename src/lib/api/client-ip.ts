import "server-only";
import type { NextRequest } from "next/server";

/** Best-effort client IP from the standard reverse-proxy header (Vercel sets this). */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}
