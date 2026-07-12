/**
 * Words a public menu slug (`/m/[slug]`) may never take — a user picking
 * `menumaker.ai/m/admin` would either collide with a real route (if one
 * ever moves under `/m/`) or just be confusing. Two groups:
 *
 * 1. Every actual top-level segment under `src/app/` today (derived by
 *    reading the directory tree directly, not guessed) — route groups like
 *    `(auth)`/`(dashboard)` don't appear in URLs so aren't listed, but the
 *    real segments nested under them (`login`, `dashboard`, ...) are.
 * 2. A conservative set of generic/likely-future segments (marketing pages
 *    that don't exist yet, infrastructure paths) — cheap to reserve now,
 *    expensive to explain later why an early user's QR code needs to
 *    change because `/m/about` collided with a real page.
 */
export const RESERVED_SLUGS = [
  // Real top-level app/ segments (see src/app/ tree).
  "admin",
  "api",
  "auth",
  "design-system",
  "menus",
  "dashboard",
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "m",
  "new",
  // Generic/infrastructure.
  "www",
  "static",
  "assets",
  "public",
  "images",
  "fonts",
  "favicon",
  "robots.txt",
  "sitemap.xml",
  "_next",
  // Likely future marketing/legal pages.
  "about",
  "contact",
  "support",
  "help",
  "pricing",
  "terms",
  "privacy",
  "blog",
  "docs",
] as const;

const RESERVED_SLUGS_SET = new Set<string>(RESERVED_SLUGS);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS_SET.has(slug.toLowerCase());
}
