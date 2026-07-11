/**
 * Central place for API rate-limit numbers — change here, not scattered
 * through Route Handlers. See docs/api-conventions.md for the fixed-window
 * tradeoff and key scheme.
 */
export const API_RATE_LIMITS = {
  authenticated: { limit: 60, windowSeconds: 60 },
  public: { limit: 20, windowSeconds: 60 },
} as const;

export type RateLimitTier = keyof typeof API_RATE_LIMITS;
