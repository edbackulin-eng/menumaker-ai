import type { Database } from "@/types/database.types";

/** The subset of menu_source_type that comes from an uploaded file — 'text' (pasted) and 'manual' aren't parsed, so they're excluded here on purpose. */
export type ParsableSourceType = Extract<
  Database["public"]["Enums"]["menu_source_type"],
  "pdf" | "docx" | "xlsx"
>;

/**
 * Central, non-env business config for the Menu Generator (Stage 7) — mirrors
 * the pattern of src/lib/api/rate-limit-config.ts (Stage 5): tunable numbers
 * live here, not scattered as magic numbers through routes/services.
 */
export const MENU_GENERATOR_CONFIG = {
  /**
   * How many menus a user can create without spending paid credits.
   * Originally briefed as 3; the Product Owner revised this down to 1 for
   * the initial launch (tighter cost control while real usage patterns are
   * still unknown) — see credits_balance.free_menus_used, consumed via
   * consume_menu_creation_credit() (migration 20260712091000).
   */
  freeMenuLimit: 1,

  /** Keep in sync with the `menu-uploads` bucket's file_size_limit (migration 20260712090000). */
  maxFileSizeBytes: 10 * 1024 * 1024,
} as const;

/** MIME type -> menu_source_type, and the single source of truth for which file types the import endpoint accepts. */
export const ALLOWED_FILE_MIME_TYPES: Record<string, ParsableSourceType> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};
