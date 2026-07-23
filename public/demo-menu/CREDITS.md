# Demo menu photos

Sample dish photos used only by the dashboard empty-state preview carousel
(`src/components/dashboard/menu-preview-carousel.tsx`).

They ship as local static assets on purpose: the first screen a brand-new
user sees must not depend on the Pexels API being reachable, correctly
keyed, or under its rate limit. The same three files are reused across all
four layout engines, so the browser downloads them once for the whole
carousel rather than once per slide.

Pre-sized to 800x600 and re-encoded as WebP at the size they are actually
displayed — deliberately not routed through `dishPhotoUrlForEngine`, whose
crop sizes (up to 1200px for Editorial) are budgeted for full-page PNG/PDF
exports, not for a scaled-down preview.

Source: Pexels (https://www.pexels.com/license/) — free to use, including
commercially, with no attribution required. Credited here regardless.

- `grilled-salmon.webp` (Grilled salmon) — Roken Manases — https://www.pexels.com/photo/plate-of-grilled-salmon-and-rice-on-a-blue-background-19725453/
- `truffle-pasta.webp` (Truffle pasta) — Shameel mukkath — https://www.pexels.com/photo/yellow-pasta-on-white-ceramic-plate-5639995/
- `burrata-salad.webp` (Burrata salad) — Bernhard HAGEN — https://www.pexels.com/photo/soup-in-a-bowl-12771066/
