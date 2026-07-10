const LOCALE_TAG_PATTERN = /^([a-zA-Z]{2})(-([a-zA-Z]{2}))?/;

/** Derives a `profiles.locale`-compatible tag (e.g. "uk-UA") from an Accept-Language header. */
export function parseAcceptLanguage(header: string | null, fallback = "en"): string {
  if (!header) return fallback;
  const first = header.split(",")[0]?.trim();
  if (!first) return fallback;

  const match = LOCALE_TAG_PATTERN.exec(first);
  if (!match) return fallback;

  const language = match[1]!.toLowerCase();
  const region = match[3]?.toUpperCase();
  return region ? `${language}-${region}` : language;
}
