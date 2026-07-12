/**
 * Central place for API rate-limit numbers — change here, not scattered
 * through Route Handlers. See docs/api-conventions.md for the fixed-window
 * tradeoff and key scheme.
 */
export const API_RATE_LIMITS = {
  authenticated: { limit: 60, windowSeconds: 60 },
  public: { limit: 20, windowSeconds: 60 },
  // Stricter than `authenticated`: AI calls cost real money (Anthropic
  // usage), unlike ordinary CRUD requests — this bounds runaway/accidental
  // client-side loops independently of a user's credit balance.
  ai: { limit: 10, windowSeconds: 60 },
  // PDF/PNG/QR generation (Stage 11) is CPU/memory-heavy (font embedding,
  // image rasterization, multi-page layout) but costs no credits — a tier
  // between `ai` and `authenticated` bounds the resource cost without
  // needing a whole credits-ledger conversation for a free action.
  export: { limit: 15, windowSeconds: 60 },
} as const;

export type RateLimitTier = keyof typeof API_RATE_LIMITS;
