import type { MetadataRoute } from "next";

import { isDemoMode } from "@/config/demo";
import { SITE_URL } from "@/config/seo";

/**
 * `/robots.txt`. Static (build-time) since it depends on nothing but the
 * site origin — no DB, no per-request data.
 *
 * Every disallowed path is locale-agnostic-aware: `routing.localePrefix`
 * is `"always"`, so the protected app segments (`PROTECTED_PREFIXES` in
 * `src/proxy.ts`: `/dashboard`, `/menus`) only ever appear *under* a locale
 * (`/en/dashboard`, `/uk/menus/new`, ...) — hence the `/*​/dashboard`-style
 * wildcards rather than bare `/dashboard`.
 *
 * Public menus (`/m/[slug]`) are deliberately NOT disallowed here. They
 * carry a page-level `noindex` meta tag instead (Stage 15 report — a
 * business publishes a menu to hand out a QR code, not to appear in
 * search, so the default is off). Blocking them in robots.txt as well
 * would be the classic self-defeating combination: a disallowed page's
 * `<meta name="robots">` is invisible to a crawler that was never allowed
 * to fetch it, which can leave a bare URL (no title, no snippet) sitting
 * in the index instead of being kept out of it.
 */
export default function robots(): MetadataRoute.Robots {
  // Demo (portfolio) build must never appear in search — disallow the whole
  // site. Pairs with the page-level `noindex` added in DEMO_MODE metadata so
  // any URL already crawled is dropped, not left as a bare entry.
  if (isDemoMode) {
    return {
      rules: { userAgent: "*", disallow: "/" },
      sitemap: `${SITE_URL.origin}/sitemap.xml`,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/*/dashboard",
        "/*/dashboard/*",
        "/*/menus",
        "/*/menus/*",
        "/admin",
        "/admin/*",
        "/api",
        "/api/*",
        "/auth/*",
        "/design-system",
        "/design-system/*",
      ],
    },
    sitemap: `${SITE_URL.origin}/sitemap.xml`,
  };
}
