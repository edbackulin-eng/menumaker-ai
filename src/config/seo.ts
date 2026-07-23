import { publicEnv } from "@/config/env";
import { routing } from "@/i18n/routing";

/**
 * Absolute site origin — the single source every SEO surface (metadataBase,
 * canonical URLs, sitemap entries, JSON-LD `url` fields) resolves against.
 * Backed by the same `NEXT_PUBLIC_APP_URL` the QR/export code already uses,
 * so there is exactly one place that knows the site's real domain. Resolves
 * to `http://localhost:3000` until a production domain is set on Vercel —
 * everything built on top of this constant updates automatically then.
 */
export const SITE_URL = new URL(publicEnv.NEXT_PUBLIC_APP_URL);

/**
 * Per-locale `alternates.languages` for a marketing page at `pathname`
 * (locale-free — `"/"`, or `"/pricing"` once that exists), plus
 * `x-default` pointing at the routing's default locale.
 *
 * Deliberately a per-page helper, not a value set once on `[locale]/
 * layout.tsx`: a layout-level value would be inherited by every page under
 * it — login, the dashboard, the menu-creation wizard — and would have
 * them all advertise language alternates pointing at the *homepage*, which
 * is wrong for a page that isn't the homepage. Only pages that actually
 * have meaningful per-locale URL variants should call this, on themselves.
 */
export function buildLocaleAlternates(pathname: string) {
  const suffix = pathname === "/" ? "" : pathname;
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `/${locale}${suffix}`]),
  );
  return {
    languages: {
      ...languages,
      "x-default": `/${routing.defaultLocale}${suffix}`,
    },
  };
}
