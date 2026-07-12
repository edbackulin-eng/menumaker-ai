/**
 * Curated locales for `profiles.locale` (Stage 2). Doesn't drive any actual
 * UI translation yet (full i18n is a later stage) — this is just the field
 * becoming editable now, per the brief, ahead of that.
 */
export const CURATED_LOCALES = [
  { id: "uk", label: "Українська" },
  { id: "en", label: "English" },
  { id: "pl", label: "Polski" },
  { id: "de", label: "Deutsch" },
  { id: "es", label: "Español" },
] as const;

export type LocaleId = (typeof CURATED_LOCALES)[number]["id"];

export function isLocaleId(value: string): value is LocaleId {
  return CURATED_LOCALES.some((locale) => locale.id === value);
}

export const PROFILE_CONFIG = {
  /** Keep in sync with the `avatars` bucket's file_size_limit (migration 20260712180000). */
  maxAvatarSizeBytes: 2 * 1024 * 1024,
} as const;

export const ALLOWED_AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
