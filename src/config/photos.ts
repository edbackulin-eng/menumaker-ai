/**
 * Non-secret dish-photo config (Stage 2) — mirrors src/config/profile.ts's
 * PROFILE_CONFIG/ALLOWED_AVATAR_MIME_TYPES pattern for the same reason:
 * client and server must validate an uploaded replacement photo against
 * the exact same limits, so they live in one place instead of duplicated
 * magic numbers.
 */
export const PHOTO_CONFIG = {
  /** Keep in sync with the `menu-photos` bucket's file_size_limit (migration 20260718090000). */
  maxPhotoSizeBytes: 5 * 1024 * 1024,
  /**
   * How many results to request from the provider per search, and cache in
   * `dish_photos.candidates` (migration 20260718100000). One Pexels call
   * fetches this many; "Показати ще" pages through them client-side
   * (gridPageSize at a time) with zero further requests — this is the
   * number that makes that possible.
   */
  candidatesPerSearch: 15,
  /** How many candidates the picker grid shows per page/"Показати ще" click. */
  gridPageSize: 5,
  /**
   * Style-suffix hypothesis (Stage 2 continuation): append a fixed phrase
   * (see styleSuffix() in photo-style.ts) to every AI-generated searchQuery
   * in a menu, so stock photos lean toward one visual motif instead of
   * looking like a collage. The PO wants to eyeball the effect on a real
   * grid before committing to it — flip this to `false` to fully disable
   * with no other code changes.
   */
  styleSuffixEnabled: true,
} as const;

export const ALLOWED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const PHOTO_EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
