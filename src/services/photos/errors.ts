/**
 * Thrown by a PhotoProvider implementation for actual failures (network,
 * rate limit, invalid API key) — never for "no photo found", which is a
 * `null` return, not an error (see types.ts). Always caught by the photo
 * lookup service (find-dish-photo.ts) and turned into a placeholder; never
 * meant to reach a Route Handler as an unhandled error, so this
 * deliberately isn't an ApiError subclass.
 */
export class PhotoProviderError extends Error {
  constructor(
    message: string,
    public readonly reason: "rate_limited" | "network" | "provider_error",
  ) {
    super(message);
    this.name = "PhotoProviderError";
  }
}
