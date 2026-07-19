import type { MenuLayoutEngine } from "@/lib/utils/resolve-menu-style";

/**
 * Requests a differently-sized crop of an already-known Pexels photo by
 * rewriting the CDN query string, keyed by which layout engine will
 * display it.
 *
 * Why this works with zero new network calls: Pexels' `src.tiny` /
 * `src.small` / `src.medium` / `src.large` are not different images — they
 * are the exact same base URL (`.../pexels-photo-<id>.jpeg`) with different
 * `h`/`w`/`fit` query parameters (verified directly against a live API
 * response). So any Pexels URL we already have on hand — whichever size we
 * originally stored — can be re-requested at any other size just by
 * swapping its query string. `item.photoUrl` is chosen once at the Review
 * step, before the Template step has picked an engine, so this is applied
 * at *render* time in each engine's own tree rather than baked into what
 * gets stored.
 *
 * `fit=crop&h=N&w=N` (square) regardless of the engine's actual display
 * aspect: every current photo slot (Modern's 60×110px box, Grid's 4:3
 * tile) uses CSS/`object-fit: cover` on top of this anyway, so what
 * matters here is pixel count, not aspect — a larger square crop still
 * looks correct once the browser (or Satori, or react-pdf) crops it into
 * its own box. Deliberately not `src.medium`/`src.large` verbatim: those
 * omit `fit=crop` and merely bound within a box, which produces a
 * non-square result for a non-square source photo; a forced square crop
 * is what every current engine's placeholder-and-photo swap already
 * assumes.
 */
const PEXELS_HOSTNAME = "images.pexels.com";

/**
 * Target crop size (px, square) per layout engine.
 *
 * A `Record`, not a lookup with a default, for the same reason
 * LAYOUT_ENGINE_SET in resolve-menu-style.ts is one: it must cover every
 * member of MenuLayoutEngine, so forgetting an engine here is a compile
 * error instead of that engine silently inheriting some other engine's
 * size. When Editorial (Stage 3, not yet built) lands with a full-width
 * hero photo, its entry needs a generous size from the start — TypeScript
 * will refuse to compile this file until one is added.
 *
 * - `classic`: the engine never renders `item.photoUrl` today (no photo
 *   slot exists in its DOM/PDF/PNG trees) — sized the same as before this
 *   fix existed, purely so the map stays total.
 * - `banner-two-column` (Modern): unchanged on purpose. Its largest real
 *   usage is a 110px box in the PNG/PDF export; 200 (≈ Pexels' own `tiny`
 *   crop) was never the bug here — Grid was.
 * - `grid`: cards run up to ~380px CSS width on desktop and ~360px in the
 *   PNG export. 800 covers a 2x-retina display of that with margin —
 *   this is the fix: `small` (130px) stretched across a ~380px box is
 *   what was blurry.
 */
const DISH_PHOTO_CROP_SIZE: Record<MenuLayoutEngine, number> = {
  classic: 130,
  "banner-two-column": 200,
  grid: 800,
};

/**
 * Rewrites `url` to request `DISH_PHOTO_CROP_SIZE[engine]` from Pexels'
 * CDN. A non-Pexels URL (a user's own upload, stored in Supabase Storage)
 * is returned unchanged — those are already served at whatever resolution
 * the uploader provided, and resizing someone else's asset is not this
 * function's job.
 */
export function dishPhotoUrlForEngine(url: string, engine: MenuLayoutEngine): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (parsed.hostname !== PEXELS_HOSTNAME) {
    return url;
  }

  const size = DISH_PHOTO_CROP_SIZE[engine];
  parsed.search = "";
  parsed.searchParams.set("auto", "compress");
  parsed.searchParams.set("cs", "tinysrgb");
  parsed.searchParams.set("fit", "crop");
  parsed.searchParams.set("h", String(size));
  parsed.searchParams.set("w", String(size));
  return parsed.toString();
}
