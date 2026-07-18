export interface PhotoSearchResult {
  photoUrl: string;
  thumbUrl: string;
  width: number | null;
  height: number | null;
  externalId: string | null;
  attributionName: string | null;
  attributionUrl: string | null;
}

/**
 * Provider-agnostic contract for dish-photo search, modeled on
 * src/services/ai/types.ts's AIProvider — every caller (the photo lookup
 * service) is written against this interface, not against Pexels directly.
 * Adding a second provider (e.g. AI image generation, deliberately deferred
 * per the Stage 2 plan — arithmetic doesn't work yet at current pricing)
 * means implementing this interface and wiring it into
 * provider-factory.ts; no call site elsewhere changes.
 *
 * Returns `[]` on "nothing found" rather than throwing — that's an
 * expected, common outcome the caller must handle with a placeholder, not
 * an error path. Throws only for actual failures (network, rate limit,
 * invalid API key) so the caller can tell "no photo exists" and "the
 * provider is unavailable right now" apart if it ever needs to.
 */
export interface PhotoProvider {
  /**
   * Returns up to `count` results, ordered by the provider's own
   * relevance ranking. `count` exists so the picker grid (Stage 2
   * continuation) can fetch enough candidates in one call to page through
   * "Показати ще" client-side afterwards — every result past the first is
   * otherwise unused, but fetching them one at a time would multiply the
   * request count instead of the response size.
   */
  search(query: string, count?: number): Promise<PhotoSearchResult[]>;
}
