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

/**
 * Which render tree draws the menu (Stage 2 final).
 *
 * Everything else in ResolvedMenuStyle is a *value* the one shared render
 * tree interpolates (a color, a font, a column count). A layout engine is a
 * different tree entirely: Modern's banner, dot leaders, per-row 60×60
 * photo, badges and footer are structural, and no amount of config on the
 * classic components could produce them.
 *
 * `classic` is the tree every template used before this existed and stays
 * the fallback for anything unrecognised — all 12 pre-Stage-3 templates
 * render byte-identically, same guarantee the Stage 13 fields were given.
 * It is also the only safe fallback target: it imposes no structural
 * requirement on the content (no banner, no venue data, no photos), so it
 * can render any menu, which is what makes it a valid answer to "this
 * engine id means nothing to me".
 *
 * Adding an engine (Stage 3: grid, classic-elegant, editorial) means adding
 * a member here — which then produces a compile error in each of the three
 * renderer registries until its component trio exists. That exhaustiveness
 * is the point: a half-added engine cannot silently fall through to
 * classic in one renderer while working in the other two.
 */
export type MenuLayoutEngine = "classic" | "banner-two-column" | "grid" | "classic-elegant";

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
  /** Which render tree draws this menu — see MenuLayoutEngine. */
  layoutEngine: MenuLayoutEngine;
  /** Engine-specific: whether the Modern row renders `item.badges`. Config-gated so noisy AI badge output can be hidden without a migration or a schema change. */
  showBadges: boolean;
  /** Stage 13 (menu template visual redesign): category-heading font, distinct from the body font — a real typographic pair, not one font used everywhere. Defaults to `fontId` when a template doesn't set one. */
  headingFontId: FontId;
  /** `null` = no override; renderers fall back to their own ambient/neutral background (identical to pre-Stage-13 behavior). */
  background: TemplateBackground | null;
  categoryHeaderStyle: CategoryHeaderStyle;
  cornerRadius: CornerRadius;
  categoryNameTransform: CategoryNameTransform;
  cardShadow: boolean;
  /**
   * The template's engine-specific color set, raw and unparsed.
   *
   * Deliberately left as an untyped bag here: each engine's palette has a
   * different shape, and this module has no business knowing any of them —
   * it would turn into a union that grows with every engine. The owning
   * engine parses it against its own defaults (see parseGridPalette), so a
   * missing or malformed palette degrades to that engine's built-in look
   * rather than failing the render.
   *
   * `null` for every pre-Stage-3 template, which is why they are unaffected.
   */
  palette: Record<string, unknown> | null;
}

const CORNER_RADIUS_VALUES: CornerRadius[] = ["sharp", "rounded", "soft"];
const CATEGORY_HEADER_STYLES: CategoryHeaderStyle[] = ["solid-bar", "underline", "boxed-outline"];

function isCornerRadius(value: unknown): value is CornerRadius {
  return typeof value === "string" && CORNER_RADIUS_VALUES.includes(value as CornerRadius);
}

function isCategoryHeaderStyle(value: unknown): value is CategoryHeaderStyle {
  return typeof value === "string" && CATEGORY_HEADER_STYLES.includes(value as CategoryHeaderStyle);
}

// A `Record<MenuLayoutEngine, true>`, not a `MenuLayoutEngine[]`, on
// purpose: this is the runtime guard every DB `engine` value passes
// through, and an array literal typed as `MenuLayoutEngine[]` does NOT have
// to be exhaustive — a list missing an engine is still assignable to the
// type, so it compiles clean while silently sending that engine to the
// classic fallback. A Record's keys must cover the whole union, so
// omitting one here is a compile error. (This is exactly the bug that
// shipped the first time `grid` was added: present in the type, absent
// from the list, rendered as classic with no error anywhere.)
const LAYOUT_ENGINE_SET: Record<MenuLayoutEngine, true> = {
  classic: true,
  "banner-two-column": true,
  grid: true,
  "classic-elegant": true,
};

function isLayoutEngine(value: unknown): value is MenuLayoutEngine {
  return typeof value === "string" && value in LAYOUT_ENGINE_SET;
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
export interface TemplateStyleSource {
  /** `menu_templates.config` — the classic engine's fields. */
  config?: Record<string, unknown> | null;
  /** `menu_templates.engine` — which render tree runs. */
  engine?: string | null;
  /** `menu_templates.palette` — the engine's color set, parsed by that engine. */
  palette?: Record<string, unknown> | null;
}

/**
 * Takes one object rather than positional arguments on purpose. Stage 3
 * adds engines that each read another `menu_templates` column
 * (`typography`, `photo_policy`), and a positional signature would have
 * grown a new parameter per engine — the shape where call sites eventually
 * pass arguments in the wrong order. Adding a field here changes no call
 * site that doesn't need it.
 */
export function resolveTemplateDefaults(
  source: TemplateStyleSource | null | undefined,
): ResolvedMenuStyle {
  const config = source?.config ?? {};
  const templateEngine = source?.engine;
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
    // Stage 3 promoted this out of the config blob into its own constrained
    // column. The column wins; `config.layoutEngine` is still read as a
    // fallback because the migration deliberately left that key in place —
    // rolling the code back to a build that only knows the blob must not
    // downgrade Modern to the classic tree, and neither must rolling
    // forward before the backfill has been verified. Once the follow-up
    // migration drops the key, this second branch becomes dead and goes
    // with it.
    layoutEngine: isLayoutEngine(templateEngine)
      ? templateEngine
      : isLayoutEngine(config.layoutEngine)
        ? config.layoutEngine
        : "classic",
    showBadges: config.showBadges === true,
    headingFontId,
    background: parseBackground(config.background),
    categoryHeaderStyle: isCategoryHeaderStyle(config.categoryHeaderStyle)
      ? config.categoryHeaderStyle
      : "solid-bar",
    cornerRadius: isCornerRadius(config.cornerRadius) ? config.cornerRadius : "rounded",
    categoryNameTransform,
    cardShadow: config.cardShadow === true,
    palette: source?.palette ?? null,
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

/**
 * The menu's own light surfaces, as literal hex — deliberately NOT
 * `var(--color-surface)` / `bg-background` / `border-border`.
 *
 * A generated menu is a printed artifact belonging to a restaurant, not a
 * surface of our site: it stays light no matter what the application theme
 * does. Before this existed, the menu render tree reached for the app's
 * semantic tokens, so flipping the app to dark (Stage 14) turned every
 * menu card near-black — in the editor preview, on the public QR page, and
 * in the template gallery alike.
 *
 * Values are the pre-dark-theme neutrals, chosen so the rendered menu is
 * byte-for-byte what it was before the theme swap. They intentionally match
 * EXPORT_TOKENS (src/lib/export/design-tokens.ts), which is the same
 * palette for the Satori/react-pdf renderers that can't read CSS variables
 * at all.
 *
 * Rule: nothing under src/components/menu-render/ may reference a
 * `--color-*` token or an app Tailwind color class. See
 * docs/design-tokens.md for the grep that enforces this.
 */
export const MENU_SURFACE = {
  /** Page canvas behind the menu, when the template sets no background of its own. */
  pageBackground: "#fafafa",
  /** Category card fill, when the template sets no background of its own. */
  card: "#ffffff",
  /** Card border / hairlines. */
  border: "#e5e5e5",
} as const;

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
