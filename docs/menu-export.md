# Menu Export (Stage 11)

Four export formats from one menu: Web (public page), QR (points at the Web
page), PNG, PDF. All four read the exact same source data —
`menus.content` + `menus.style_overrides`, resolved through
`resolveTemplateDefaults()`/`resolveEffectiveStyle()`
(`src/lib/utils/resolve-menu-style.ts`) and `applyStyleOrder()`
(`src/lib/utils/menu-content-order.ts`) — so a menu can never look
different across formats because of stale/duplicated logic. What differs is
only how each format turns that same data into pixels.

## Why three different rendering trees, not one

The brief's instruction was "reuse the Stage 7.5 render component, don't
duplicate the rendering logic." Taken literally, that's only possible for
Web — PNG and PDF fundamentally can't run the same JSX:

- **Web** (`app/m/[slug]/page.tsx`) genuinely reuses the editor's rendering
  logic. `MenuLivePreview` (the editor's component) was refactored to pull
  its actual visual pieces — `MenuItemContent`, `MenuCategoryShell`
  (`src/components/menu-render/`) — out of the dnd-kit-specific
  `SortableItem`/`SortableCategory` wrappers. `MenuStaticView` composes the
  same pieces without the drag machinery. Same Tailwind classes, same
  markup, same CSS custom properties — pixel-identical to the editor minus
  the drag handles, because it's _the same code_.
- **PNG** (`src/lib/export/render-menu-png.tsx`) uses `next/og`'s
  `ImageResponse`, which runs on Satori — a constrained flexbox-only JSX
  renderer with no Tailwind class support, no CSS custom properties, and
  (verified directly) a font parser that crashes on the variable-font files
  next/font itself uses. It needs its own inline-styled JSX tree.
- **PDF** (`src/lib/export/render-menu-pdf.tsx`) uses
  `@react-pdf/renderer`, whose `Document`/`Page`/`View`/`Text` primitives
  aren't HTML at all — there's no DOM, no CSS, just PDF layout primitives.
  Also its own tree.

Duplicating the _data model_ or the _style-resolution logic_ across these
would have been the real risk; duplicating unavoidably-different rendering
primitives is not the same thing. `src/lib/export/design-tokens.ts` mirrors
the app's neutral color palette as plain hex (both renderers need concrete
values, not CSS variables) so at least the _colors_ stay centrally defined
rather than copy-pasted per file.

## Fonts

All three renderers need real font files — next/font's browser-only
`@font-face` output isn't usable from Node. `src/assets/fonts/` holds
repo-committed binaries, sourced twice per curated font (see
`src/lib/export/fonts.ts` for the full reasoning):

- `pdf/*.ttf` — one full-coverage file per family (Cyrillic + Latin +
  digits + currency symbols all in one), sourced from the same
  `google/fonts` repo next/font itself draws from. `@react-pdf/renderer`
  (via `fontkit`) handles these, including the variable-font ones, without
  issue.
- `png/*-cyrillic.woff` + `png/*-latin.woff` — per-subset static files from
  `@fontsource` (used once, as a font _source_, not a runtime dependency —
  removed after copying the files out). Satori's font parser can't handle
  the variable-font files that work fine for PDF, so PNG needs static
  weights; a single subset alone doesn't cover both scripts, but Satori
  supports registering multiple buffers under one family as glyph-coverage
  fallbacks, which does.

## PDF: single column regardless of the menu's `columns` setting

A deliberate deviation from the live preview, not an oversight.
`@react-pdf/renderer` paginates by measuring vertical flow within a
`<Page>`; parallel flex columns of uneven height don't reliably continue
onto the next page in alignment with each other. The brief's hard
requirement for PDF specifically is "splits across pages correctly, never
clips content" — that safety property matters more for a printed document
than exactly replicating the on-screen column count, so PDF always lays
categories out in one vertical column. Verified directly with a
180-item/12-category menu: 13 pages, nothing truncated.

## PNG: single tall image, no upper height cap

PNG has no pagination fallback the way PDF does — Satori's `ImageResponse`
needs an explicit canvas height chosen upfront (no intrinsic
content-based sizing), estimated from category/item counts in
`estimateCanvasHeight()`. An earlier version capped this at 4200px; testing
with the same 180-item menu showed that cap would have silently clipped
the bottom of the image with no way to recover the lost content. The cap
now sits at 20000px — high enough that no realistic menu hits it, still
guarding against a truly pathological content size blowing up render
time/memory.

## Storage writes use service-role, not the caller's session

`src/services/export/storage.ts` uploads via `createServiceClient()`, not
the RLS-scoped session client the bucket's own "write to your own folder"
policy was written for. Directly reproduced: a genuinely
session-authenticated client hit a row-level-security rejection against
_both_ the new `menu-exports` bucket and the pre-existing `avatars`
bucket — the "own-folder" policy pattern from Stage 8 had never actually
been exercised by real authenticated-role traffic (the avatars upload route
already used service-role too), so its issue went uncaught until this
stage's testing hit it directly. Switched to the proven service-role path
rather than chasing the underlying Storage RLS behavior further; the
own-folder policies remain in place as defense-in-depth even though they
aren't the load-bearing check.

## Credits

Export (PDF/PNG/QR generation, publishing) does not spend credits. Credits
are charged once, at AI-analysis time (Stage 6) — export is just
re-presenting content the user already paid for, as many times and in as
many formats as they like. Charging per-export would mean a user
re-downloading a PDF after fixing a typo pays twice for the same menu, which
is confusing and punitive for zero product benefit; the actual expensive
resource (Anthropic API calls) was never touched by export in the first
place. The `export` rate-limit tier (15/min, shared across PDF/PNG/QR)
exists purely to bound server CPU/memory cost, independent of any credits
conversation.
