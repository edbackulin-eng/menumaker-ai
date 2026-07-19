import type { LocaleId } from "@/config/profile";

/**
 * Currencies a menu can be priced in.
 *
 * Each entry declares BOTH forms — the typographic `symbol` and the letter
 * `code` — and never a pre-decided answer about which one to print. Which
 * one actually renders is decided by one rule, in
 * resolveCurrencyDisplay(): symbol where our export fonts have the glyph,
 * letters where they don't. No currency is special-cased.
 *
 * That matters because Stage 3 adds templates on new fonts. A per-currency
 * hardcode ("UAH is the weird one") would silently print a .notdef box the
 * first time a font arrived without some other glyph; a rule keeps working.
 */
export const CURATED_CURRENCIES = [
  { id: "UAH", symbol: "₴", code: "грн", label: "Гривня (грн)" },
  { id: "USD", symbol: "$", code: "USD", label: "US Dollar ($)" },
  { id: "EUR", symbol: "€", code: "EUR", label: "Euro (€)" },
  { id: "GBP", symbol: "£", code: "GBP", label: "British Pound (£)" },
  { id: "PLN", symbol: "zł", code: "PLN", label: "Złoty (zł)" },
  { id: "CZK", symbol: "Kč", code: "CZK", label: "Koruna (Kč)" },
  { id: "JPY", symbol: "¥", code: "JPY", label: "Yen (¥)" },
  { id: "RON", symbol: "lei", code: "RON", label: "Leu (lei)" },
  { id: "HUF", symbol: "Ft", code: "HUF", label: "Forint (Ft)" },
] as const;

export type CurrencyId = (typeof CURATED_CURRENCIES)[number]["id"];

export function isCurrencyId(value: string): value is CurrencyId {
  return CURATED_CURRENCIES.some((c) => c.id === value);
}

/**
 * The single source of truth for the rule above: symbols every font binary
 * this repo ships (src/assets/fonts, PDF `.ttf` + Satori `.woff` subsets)
 * is confirmed to draw. Anything absent here falls back to letters.
 *
 * Confirmed by *rendering* each candidate through the PNG export and
 * looking at the output — not by inspecting font tables. Table inspection
 * is not trustworthy for our Satori subsets: `hasGlyphForCodePoint`
 * reported `ł` missing from every `.woff`, yet `zł` renders correctly.
 * Rendering is the only check that answers the real question.
 *
 * What is currently NOT here, and why: ₴ ₽ ₺ live in Unicode's Currency
 * Symbols block (U+20A0–U+20BF), which the committed `cyrillic`/`latin`
 * subsets don't cover — all three drew .notdef boxes. ₴ additionally has
 * no glyph at all in playfair-display.ttf, the face Modern sets prices in.
 * Admitting one of them here means shipping `latin-ext` subsets for all
 * curated fonts first, then re-running the render check.
 *
 * To re-verify (e.g. after adding a font in Stage 3): render a menu whose
 * prices use each symbol through POST /api/menus/[id]/export/png and open
 * the result. A box means remove the symbol from this set.
 */
const SYMBOLS_RENDERABLE_IN_EXPORT_FONTS: ReadonlySet<string> = new Set([
  "$",
  "€",
  "£",
  "¥",
  "zł",
  "Kč",
  "lei",
  "Ft",
]);

/** True when the typographic symbol is safe to print; false means use the letter code. */
export function isSymbolRenderable(symbol: string): boolean {
  return SYMBOLS_RENDERABLE_IN_EXPORT_FONTS.has(symbol);
}

/**
 * Applies the rule to one stored currency value.
 *
 * `content.currency` is a free-form string that predates this list —
 * analyzeMenu writes whatever the source document said ("UAH", "грн",
 * "€"…). So an unrecognised value passes through verbatim: an older menu
 * keeps printing exactly what it printed before.
 */
export function resolveCurrencyDisplay(currency: string | undefined): string | undefined {
  if (!currency) return undefined;
  const match = CURATED_CURRENCIES.find((c) => c.id === currency);
  if (!match) return currency;
  return isSymbolRenderable(match.symbol) ? match.symbol : match.code;
}

/** Sensible starting currency when a menu has none — inferred from the menu's own content locale rather than left blank. */
const LOCALE_DEFAULT_CURRENCY: Record<LocaleId, CurrencyId> = {
  uk: "UAH",
  pl: "PLN",
  de: "EUR",
  es: "EUR",
  en: "USD",
};

export function defaultCurrencyForLocale(locale: string): CurrencyId {
  return LOCALE_DEFAULT_CURRENCY[locale as LocaleId] ?? "USD";
}
