import {
  CURATED_ACCENT_COLORS,
  CURATED_FONTS,
  isAccentColorId,
  isFontId,
  type AccentColorId,
  type FontId,
  type LayoutColumns,
} from "@/config/menu-style";
import type { StyleOverridesInput } from "@/lib/validations/menu-style";

export interface ResolvedMenuStyle {
  accentColorId: AccentColorId;
  fontId: FontId;
  columns: LayoutColumns;
}

/**
 * Parses a template's untyped `config` jsonb (Stage 2) into typed defaults,
 * falling back to the first curated option for anything missing/malformed
 * — a template row with `config = {}` (the seeded seed-data state for most
 * of the 12 templates) must still resolve to *something* renderable.
 * Originally inlined in the editor page (Stage 7.5); pulled out once the
 * public web menu page (Stage 11) and PNG/PDF export needed the identical
 * logic — four independent re-implementations was the actual duplication
 * risk, not this one shared function.
 */
export function resolveTemplateDefaults(
  templateConfig: Record<string, unknown> | null | undefined,
): ResolvedMenuStyle {
  const config = templateConfig ?? {};
  const accentColorId =
    typeof config.defaultAccentColorId === "string" && isAccentColorId(config.defaultAccentColorId)
      ? config.defaultAccentColorId
      : CURATED_ACCENT_COLORS[0].id;
  const fontId =
    typeof config.defaultFontId === "string" && isFontId(config.defaultFontId)
      ? config.defaultFontId
      : CURATED_FONTS[0].id;
  const columns =
    config.defaultColumns === 2 || config.defaultColumns === 3 ? config.defaultColumns : 1;
  return { accentColorId, fontId, columns };
}

/** Layers a menu's own style_overrides on top of its template's defaults. */
export function resolveEffectiveStyle(
  templateDefaults: ResolvedMenuStyle,
  styleOverrides: StyleOverridesInput,
): ResolvedMenuStyle {
  return {
    accentColorId: styleOverrides.accentColorId ?? templateDefaults.accentColorId,
    fontId: styleOverrides.fontId ?? templateDefaults.fontId,
    columns: styleOverrides.columns ?? templateDefaults.columns,
  };
}
