import {
  CURATED_ACCENT_COLORS,
  CURATED_FONTS,
  isAccentColorId,
  isFontId,
  type AccentColorId,
  type FontId,
  type LayoutColumns,
} from "@/config/menu-style";
import { pickReadableTextColor } from "@/lib/utils/color-contrast";
import type { StyleOverridesInput } from "@/lib/validations/menu-style";

export type CategoryHeaderStyle = "solid-bar" | "underline" | "boxed-outline";
export type CornerRadius = "sharp" | "rounded" | "soft";
export type CategoryNameTransform = "none" | "uppercase";

export interface TemplateBackground {
  type: "solid" | "linear-gradient" | "radial-gradient";
  /** 1 color for solid, 2-3 hex values for a gradient. */
  colors: string[];
  /** Degrees, `linear-gradient` only. Defaults to 135. */
  angleDeg?: number;
}

export interface ResolvedMenuStyle {
  accentColorId: AccentColorId;
  fontId: FontId;
  columns: LayoutColumns;
  /** Stage 13 (menu template visual redesign): category-heading font, distinct from the body font — a real typographic pair, not one font used everywhere. Defaults to `fontId` when a template doesn't set one. */
  headingFontId: FontId;
  /** `null` = no override; renderers fall back to their own ambient/neutral background (identical to pre-Stage-13 behavior). */
  background: TemplateBackground | null;
  categoryHeaderStyle: CategoryHeaderStyle;
  cornerRadius: CornerRadius;
  categoryNameTransform: CategoryNameTransform;
  cardShadow: boolean;
}

const CORNER_RADIUS_VALUES: CornerRadius[] = ["sharp", "rounded", "soft"];
const CATEGORY_HEADER_STYLES: CategoryHeaderStyle[] = ["solid-bar", "underline", "boxed-outline"];

function isCornerRadius(value: unknown): value is CornerRadius {
  return typeof value === "string" && CORNER_RADIUS_VALUES.includes(value as CornerRadius);
}

function isCategoryHeaderStyle(value: unknown): value is CategoryHeaderStyle {
  return typeof value === "string" && CATEGORY_HEADER_STYLES.includes(value as CategoryHeaderStyle);
}

function parseBackground(value: unknown): TemplateBackground | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const type = raw.type;
  if (type !== "solid" && type !== "linear-gradient" && type !== "radial-gradient") return null;
  const colors = Array.isArray(raw.colors)
    ? raw.colors.filter((c): c is string => typeof c === "string")
    : [];
  if (colors.length === 0) return null;
  const angleDeg = typeof raw.angleDeg === "number" ? raw.angleDeg : undefined;
  return { type, colors, angleDeg };
}

/**
 * Parses a template's untyped `config` jsonb (Stage 2, extended Stage 13)
 * into typed defaults, falling back to safe values for anything
 * missing/malformed — most of the 12 templates still only set the original
 * three fields (`defaultAccentColorId`/`defaultFontId`/`defaultColumns`),
 * and must keep rendering *exactly* as before Stage 13 until they're
 * individually redesigned. The Stage 13 fields' fallbacks are chosen
 * specifically to reproduce the pre-Stage-13 look: `headingFontId` mirrors
 * `fontId` (one font, as before), `background: null` (no override — the
 * ambient neutral background, as before), `categoryHeaderStyle:
 * "solid-bar"` (the only style that existed before), `cornerRadius:
 * "rounded"` (the hardcoded `rounded-md` every card already had),
 * `cardShadow: false` (cards never had a shadow before).
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
  const headingFontId =
    typeof config.headingFontId === "string" && isFontId(config.headingFontId)
      ? config.headingFontId
      : fontId;
  const categoryNameTransform = config.categoryNameTransform === "uppercase" ? "uppercase" : "none";

  return {
    accentColorId,
    fontId,
    columns,
    headingFontId,
    background: parseBackground(config.background),
    categoryHeaderStyle: isCategoryHeaderStyle(config.categoryHeaderStyle)
      ? config.categoryHeaderStyle
      : "solid-bar",
    cornerRadius: isCornerRadius(config.cornerRadius) ? config.cornerRadius : "rounded",
    categoryNameTransform,
    cardShadow: config.cardShadow === true,
  };
}

/**
 * Layers a menu's own style_overrides on top of its template's defaults.
 * Only the three original fields are user-adjustable (Stage 7.5's editor
 * UI) — the Stage 13 visual-identity fields (background, header style,
 * corners, heading font, transform, shadow) are template-authored and
 * intentionally not exposed to per-menu overriding, so they pass through
 * from `templateDefaults` untouched.
 */
export function resolveEffectiveStyle(
  templateDefaults: ResolvedMenuStyle,
  styleOverrides: StyleOverridesInput,
): ResolvedMenuStyle {
  return {
    ...templateDefaults,
    accentColorId: styleOverrides.accentColorId ?? templateDefaults.accentColorId,
    fontId: styleOverrides.fontId ?? templateDefaults.fontId,
    columns: styleOverrides.columns ?? templateDefaults.columns,
  };
}

export const CORNER_RADIUS_PX: Record<CornerRadius, number> = {
  sharp: 0,
  rounded: 8,
  soft: 20,
};

/** Same conversion for both the DOM (real CSS) and Satori (supports identical `linear-gradient`/`radial-gradient` syntax) — see docs/menu-templates-design.md for why this single function covers both renderers. */
export function backgroundToCssValue(background: TemplateBackground | null): React.CSSProperties {
  if (!background) return {};
  if (background.type === "solid") {
    return { backgroundColor: background.colors[0] };
  }
  const stops = background.colors.join(", ");
  if (background.type === "linear-gradient") {
    return { backgroundImage: `linear-gradient(${background.angleDeg ?? 135}deg, ${stops})` };
  }
  return { backgroundImage: `radial-gradient(circle, ${stops})` };
}

export interface PageForeground {
  /** Body/heading text color. */
  primary: string;
  /** Muted/secondary text (item descriptions) — a translucent tint of `primary`, not a separately-chosen color, so it always stays legible against the same background `primary` was picked for. */
  secondary: string;
  /** Item-row divider lines — a faint tint of `primary`, same reasoning as `secondary`. */
  divider: string;
}

/** Matches this app's neutral design tokens (`--color-foreground` / `--color-foreground-secondary` / `--color-border`, `EXPORT_TOKENS`) exactly — a template with no custom `background` renders pixel-identical text/divider color to before Stage 13. */
const DEFAULT_PAGE_FOREGROUND: PageForeground = {
  primary: "#171717",
  secondary: "#525252",
  divider: "#e5e5e5",
};

/**
 * A template's category cards sit directly on its page background (no
 * separate opaque card fill — see docs/menu-templates-design.md), so body
 * text needs a color that's readable against *that* background, not the
 * app's own neutral one. Falls back to the exact pre-Stage-13 values when
 * a template doesn't set a custom `background`.
 */
export function resolvePageForeground(background: TemplateBackground | null): PageForeground {
  if (!background) return DEFAULT_PAGE_FOREGROUND;
  const base = pickReadableTextColor(background.colors[0]!);
  return base === "#ffffff"
    ? { primary: "#ffffff", secondary: "rgba(255,255,255,0.65)", divider: "rgba(255,255,255,0.18)" }
    : { primary: "#171717", secondary: "rgba(23,23,23,0.65)", divider: "rgba(23,23,23,0.15)" };
}
