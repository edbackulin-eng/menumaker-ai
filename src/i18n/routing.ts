import { defineRouting } from "next-intl/routing";

import { CURATED_LOCALES } from "@/config/profile";

/**
 * `CURATED_LOCALES` (src/config/profile.ts) stays the single source of
 * truth for "which locales exist" — it already covers first-wave scope
 * (en/uk/de/pl/es) from Stage 8's Profile field, and admin statistics'
 * locale breakdown reads it too. Reusing it here instead of a second list
 * avoids the two ever drifting apart.
 */
export const routing = defineRouting({
  locales: CURATED_LOCALES.map((locale) => locale.id),
  defaultLocale: "en",
  localePrefix: "always",
  localeCookie: {
    // 1 year — an explicit language choice should outlive a browser session.
    maxAge: 60 * 60 * 24 * 365,
  },
});
