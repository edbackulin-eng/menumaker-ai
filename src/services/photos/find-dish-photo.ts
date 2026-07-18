import "server-only";

import { PHOTO_CONFIG } from "@/config/photos";
import { logger } from "@/lib/logger";
import { transliterate } from "@/lib/utils/slug";
import { createServiceClient } from "@/lib/supabase/service";
import { PhotoProviderError } from "@/services/photos/errors";
import { getPhotoProvider } from "@/services/photos/provider-factory";
import type { PhotoSearchResult } from "@/services/photos/types";
import type { Json } from "@/types/database.types";

/**
 * Cache partition key — matches env.photos.ts's PHOTO_PROVIDER default.
 * Hardcoded rather than read from photosEnv here: the cache key must stay
 * stable for whichever provider actually served a given row, independent
 * of what the *currently configured* provider is.
 */
const PROVIDER_NAME = "pexels";

/**
 * One key, shared by every user's picker-grid search — this is what keeps
 * the platform under Pexels' 200 req/hour ceiling (see the Stage 2 plan's
 * answer to "when are photos searched"). Reuses the same atomic
 * check_rate_limit() RPC the per-user API rate limiter uses
 * (src/lib/api/rate-limit.ts), just keyed globally instead of by user/IP.
 */
const GLOBAL_RATE_LIMIT_KEY = "photos:pexels:global";
const GLOBAL_RATE_LIMIT = 200;
const GLOBAL_RATE_LIMIT_WINDOW_SECONDS = 3600;

export interface DishPhotoLookupInput {
  name: string;
  /** menuItemSchema's AI-generated field — see analyze-menu.ts. */
  searchQuery?: string;
  /**
   * Appended to `searchQuery` only — never to the transliteration
   * fallback below (transliterated text + an English phrase reads as
   * garbage, not a useful query). Same value for every item in one menu;
   * see styleSuffix() in config/photo-style.ts.
   */
  styleSuffix?: string;
}

export type DishPhotoCandidate = PhotoSearchResult;

function normalizeQuery(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * The AI-provided searchQuery is preferred (see analyze-menu.ts's prompt);
 * when it's missing or blank, falls back to a transliterated dish name
 * rather than sending an empty string to the photo provider — an empty
 * query must never reach the API. `name` is guaranteed non-empty by
 * menuItemSchema, and transliterate() only maps characters 1:1 (never
 * strips to empty), so this fallback always yields a non-empty query.
 */
function resolveSearchQuery(input: DishPhotoLookupInput): string {
  const provided = input.searchQuery?.trim();
  if (provided) {
    return input.styleSuffix ? `${provided} ${input.styleSuffix}` : provided;
  }
  return transliterate(input.name).trim();
}

/**
 * Looks up candidate photos for a dish: a cached candidate list (zero
 * provider calls, whether this exact query was cached by this menu or any
 * other), or a fresh provider search cached for next time. Returns `[]`
 * for every "no photos available" case (nothing found, provider
 * rate-limited, provider/network error, global quota exhausted) —
 * callers render a placeholder in all of them. An empty result is an
 * expected, routine outcome here, never an error to surface.
 *
 * Only ever writes the shared, neutral `dish_photos` cache (default +
 * candidates, both straight from the provider's own ranking) — a user's
 * pick from the resulting grid is a separate write, into
 * `menus.content.photoUrl` (see update-item-photo.ts), and never touches
 * this table. That separation is what keeps the shared cache a genuine
 * platform-wide default instead of drifting toward whatever one user
 * clicked last.
 */
export async function findDishPhotoCandidates(
  input: DishPhotoLookupInput,
): Promise<DishPhotoCandidate[]> {
  const query = resolveSearchQuery(input);
  const normalized = normalizeQuery(query);
  const supabase = createServiceClient();

  const { data: cached, error: cacheReadError } = await supabase
    .from("dish_photos")
    .select("candidates")
    .eq("provider", PROVIDER_NAME)
    .eq("query_normalized", normalized)
    .maybeSingle();

  if (cacheReadError) {
    logger.error({ err: cacheReadError, normalized }, "dish_photo_cache_read_failed");
  } else if (cached?.candidates) {
    const candidates = cached.candidates as unknown as DishPhotoCandidate[];
    if (Array.isArray(candidates) && candidates.length > 0) {
      return candidates;
    }
  }

  const { data: rateLimitRows, error: rateLimitError } = await supabase.rpc("check_rate_limit", {
    p_key: GLOBAL_RATE_LIMIT_KEY,
    p_limit: GLOBAL_RATE_LIMIT,
    p_window_seconds: GLOBAL_RATE_LIMIT_WINDOW_SECONDS,
  });
  if (rateLimitError) {
    // Fail open, same policy as src/lib/api/rate-limit.ts: a broken quota
    // check must not take photo search down entirely.
    logger.error({ err: rateLimitError }, "photo_rate_limit_check_failed");
  } else if (rateLimitRows?.[0]?.allowed === false) {
    logger.warn({ normalized }, "photo_rate_limit_exceeded");
    return [];
  }

  const provider = getPhotoProvider();
  let candidates: DishPhotoCandidate[];
  try {
    candidates = await provider.search(normalized, PHOTO_CONFIG.candidatesPerSearch);
  } catch (err) {
    if (err instanceof PhotoProviderError) {
      logger.warn({ reason: err.reason, normalized, err: err.message }, "photo_provider_failed");
    } else {
      logger.error({ err, normalized }, "photo_provider_unexpected_error");
    }
    return [];
  }

  if (candidates.length === 0) {
    return [];
  }

  const first = candidates[0]!;
  // upsert, not insert: a second concurrent lookup for the same
  // not-yet-cached query is a benign race (both calls return a valid
  // result to their caller either way), not a condition worth erroring on.
  const { error: upsertError } = await supabase.from("dish_photos").upsert(
    {
      provider: PROVIDER_NAME,
      query_normalized: normalized,
      photo_url: first.photoUrl,
      thumb_url: first.thumbUrl,
      width: first.width,
      height: first.height,
      external_id: first.externalId,
      attribution_name: first.attributionName,
      attribution_url: first.attributionUrl,
      candidates: candidates as unknown as Json,
    },
    { onConflict: "provider,query_normalized" },
  );
  if (upsertError) {
    // Not fatal — we still have real results to return, just unpersisted.
    // The next lookup for this query will simply hit the provider again.
    logger.error({ err: upsertError, normalized }, "dish_photo_cache_write_failed");
  }

  return candidates;
}
