import { z } from "zod";

import {
  CURATED_ACCENT_COLORS,
  CURATED_FONTS,
  LAYOUT_COLUMN_OPTIONS,
  type AccentColorId,
  type FontId,
} from "@/config/menu-style";

const ACCENT_COLOR_IDS = CURATED_ACCENT_COLORS.map((c) => c.id) as [
  AccentColorId,
  ...AccentColorId[],
];
const FONT_IDS = CURATED_FONTS.map((f) => f.id) as [FontId, ...FontId[]];

/**
 * Every field re-validated against the same curated lists the UI renders
 * from (src/config/menu-style.ts) — a hand-crafted request bypassing the
 * picker UI still can't set an arbitrary color or font. `categoryOrder`/
 * `itemOrder` only get well-formed-string validation here; the deeper check
 * (do these ids actually belong to this menu's current content?) needs a DB
 * read and happens in the route handler, not here.
 */
export const styleOverridesSchema = z.object({
  accentColorId: z.enum(ACCENT_COLOR_IDS).optional(),
  fontId: z.enum(FONT_IDS).optional(),
  columns: z
    .union(
      LAYOUT_COLUMN_OPTIONS.map((n) => z.literal(n)) as [
        z.ZodLiteral<1 | 2 | 3>,
        ...z.ZodLiteral<1 | 2 | 3>[],
      ],
    )
    .optional(),
  categoryOrder: z.array(z.string().min(1)).optional(),
  itemOrder: z.record(z.string().min(1), z.array(z.string().min(1))).optional(),
});
export type StyleOverridesInput = z.infer<typeof styleOverridesSchema>;
