import type { LocaleId } from "@/config/profile";

/**
 * Currencies a menu can be priced in.
 *
 * `display` is what actually gets printed next to a price, and every value
 * here was verified to render correctly in **all three** renderers — DOM,
 * Satori (PNG) and @react-pdf/renderer — using the font binaries this repo
 * ships (src/assets/fonts). That verification is not decorative: the
 * obvious choices for several of these do NOT render.
 *
 * Specifically, glyphs in Unicode's Currency Symbols block (U+20A0–U+20BF)
 * — ₴ hryvnia, ₽ ruble, ₺ lira — render as .notdef boxes in the PNG
 * export, because the committed Satori subsets only cover `cyrillic` and
 * `latin`, not the `latin-ext`/symbol ranges those live in. ₴ additionally
 * has no glyph at all in playfair-display.ttf, which is the font Modern
 * prices are set in. Both were confirmed by rendering, not by reading font
 * tables (a `hasGlyphForCodePoint` check on the .woff subsets gave a
 * false negative for `ł`, so table inspection alone is not trustworthy
 * here).
 *
 * Hence UAH prints "грн" rather than "₴": Cyrillic is fully covered by
 * every font set we ship, and it is what Ukrainian menus conventionally
 * print anyway. Switching it to the glyph requires shipping `latin-ext`
 * subsets for all seven curated fonts — a font-asset decision, not a code
 * one.
 *
 * Before adding an entry here, render it through the PNG export and look
 * at the result. Font-table inspection is not sufficient (see above), and
 * this repo currently has no automated test runner to catch it for you.
 */
export const CURATED_CURRENCIES = [
  { id: "UAH", display: "грн", label: "Гривня (грн)" },
  { id: "USD", display: "$", label: "US Dollar ($)" },
  { id: "EUR", display: "€", label: "Euro (€)" },
  { id: "GBP", display: "£", label: "British Pound (£)" },
  { id: "PLN", display: "zł", label: "Złoty (zł)" },
  { id: "CZK", display: "Kč", label: "Koruna (Kč)" },
  { id: "JPY", display: "¥", label: "Yen (¥)" },
  { id: "RON", display: "lei", label: "Leu (lei)" },
  { id: "HUF", display: "Ft", label: "Forint (Ft)" },
] as const;

export type CurrencyId = (typeof CURATED_CURRENCIES)[number]["id"];

export function isCurrencyId(value: string): value is CurrencyId {
  return CURATED_CURRENCIES.some((c) => c.id === value);
}

/**
 * A menu's stored `content.currency` is a free-form string: it predates
 * this curated list (analyzeMenu writes whatever the source document said —
 * "UAH", "грн", "€"…), and older menus must keep rendering exactly what
 * they already show. So resolution is: a known id maps to its curated
 * display; anything else passes through verbatim.
 */
export function resolveCurrencyDisplay(currency: string | undefined): string | undefined {
  if (!currency) return undefined;
  const match = CURATED_CURRENCIES.find((c) => c.id === currency);
  return match ? match.display : currency;
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
