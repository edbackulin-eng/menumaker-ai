/**
 * Overrides `@supabase/ssr`'s session-cookie `maxAge` (default 400 days —
 * the maximum Chrome allows, not a value we chose; verified directly in
 * `node_modules/@supabase/ssr/dist/main/utils/constants.js`).
 *
 * `httpOnly` stays at the package default (`false`) — a deliberate, known
 * risk, not an oversight: `src/lib/auth/use-user.ts` reads the session via
 * the browser Supabase client (`createBrowserClient`), which needs
 * `document.cookie` access to the same cookie the server sets. Setting
 * `httpOnly: true` would break client-side auth state everywhere `useUser()`
 * is read — confirmed by tracing that call site, not assumed. Shortening
 * the lifetime is the mitigation available without that breakage.
 *
 * Applied identically in three places that each construct a Supabase client
 * (`src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`,
 * `src/proxy.ts`) — imported from here so a future change can't drift
 * between them and leave the session refreshed with three different TTLs
 * depending on which code path last touched it.
 */
export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
