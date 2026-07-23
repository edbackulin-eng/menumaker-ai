import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/config/seo";

/**
 * Locale-free paths of the marketing pages worth submitting to search
 * engines. Just the landing page today — this repo has exactly one public
 * marketing page right now (Stage 15 report). Add a path here (and a
 * matching `buildLocaleAlternates()` call on that page, see
 * `src/config/seo.ts`) when a second one (pricing, about, ...) ships.
 *
 * Deliberately excludes: `/login`/`/register` (functional, not content to
 * rank), `/dashboard` and `/menus/**` (auth-gated app, Stage 15 robots.ts
 * already disallows crawling them), and `/m/[slug]` (per-business public
 * menus — Stage 15's product decision is `noindex` by default, so listing
 * them in a sitemap that exists to *invite* indexing would contradict the
 * page's own meta tag; this is a static, DB-free sitemap on purpose).
 */
const MARKETING_PATHS = ["/"];

/** Static (build-time) — no DB query, matching the "sitemap doesn't need the database yet" decision. */
export default function sitemap(): MetadataRoute.Sitemap {
  return MARKETING_PATHS.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: new URL(`/${locale}${path === "/" ? "" : path}`, SITE_URL).toString(),
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [
            l,
            new URL(`/${l}${path === "/" ? "" : path}`, SITE_URL).toString(),
          ]),
        ),
      },
    })),
  );
}
