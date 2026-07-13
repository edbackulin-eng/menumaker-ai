# Menu template visual design (Stage 13)

How `menu_templates.config` drives the visual identity of the 12 selectable
menu templates, and how that one config is reproduced consistently across
the three renderers (DOM/live-preview, PNG export via Satori, PDF export via
`@react-pdf/renderer`).

## `config` shape

`menu_templates.config` is untyped `jsonb` at the DB level (no migration
needed to add fields — see `resolveTemplateDefaults` in
`src/lib/utils/resolve-menu-style.ts` for the parsing/fallback logic). A
fully-populated config looks like:

```json
{
  "defaultAccentColorId": "golden-amber",
  "defaultFontId": "pt-sans",
  "defaultColumns": 1,
  "headingFontId": "rubik",
  "background": {
    "type": "linear-gradient",
    "colors": ["#FDF6EC", "#F3E4CC"],
    "angleDeg": 160
  },
  "categoryHeaderStyle": "solid-bar",
  "cornerRadius": "soft",
  "categoryNameTransform": "none",
  "cardShadow": true
}
```

`defaultAccentColorId` / `defaultFontId` / `defaultColumns` predate Stage 13
(Stage 7.5) and remain the only **user-adjustable** fields — a menu's own
`style_overrides` can override these three via the style editor. The other
six fields are **template-authored and fixed**: `resolveEffectiveStyle`
passes them through from the template's defaults untouched, with no per-menu
override UI.

### The six Stage 13 fields

| Field                   | Type                                                | Notes                                                                                                          |
| ----------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `headingFontId`         | `FontId`                                            | Category-heading font, distinct from the body font — a real typographic pair. Defaults to `fontId` when unset. |
| `background`            | `{type, colors, angleDeg?}` \| `null`               | See below. `null` = no override, falls back to the app's neutral background (pre-Stage-13 look).               |
| `categoryHeaderStyle`   | `"solid-bar"` \| `"underline"` \| `"boxed-outline"` | Three genuinely different category-heading compositions, not three colors of the same layout.                  |
| `cornerRadius`          | `"sharp"` \| `"rounded"` \| `"soft"`                | Maps to `CORNER_RADIUS_PX` (0 / 8 / 20).                                                                       |
| `categoryNameTransform` | `"none"` \| `"uppercase"`                           | Applies `text-transform: uppercase` + letter-spacing when set.                                                 |
| `cardShadow`            | `boolean`                                           | `box-shadow` on category cards. No effect in the PDF renderer (see Known limitations).                         |

`opaqueCard` (whether a category card paints its own white fill vs. sitting
transparent on the page background) is **derived**, not stored:
`opaqueCard = !background`. A template with no custom background keeps the
pre-Stage-13 opaque-white-card look; a template with a custom background
lets its cards sit directly on it.

### Background descriptor

```ts
interface TemplateBackground {
  type: "solid" | "linear-gradient" | "radial-gradient";
  colors: string[]; // 1 color for solid, 2-3 hex values for a gradient
  angleDeg?: number; // linear-gradient only, defaults to 135
}
```

This is a **portable gradient descriptor**, not a pre-rendered image — the
same `{type, colors, angleDeg}` data is converted per-renderer:

- **DOM and PNG (Satori)** both understand real CSS `linear-gradient()` /
  `radial-gradient()` syntax, so `backgroundToCssValue()`
  (`resolve-menu-style.ts`) produces one CSS string both consume identically.
- **PDF** (`@react-pdf/renderer`) has no CSS gradient support at all — its
  styling system only accepts a solid `backgroundColor`. `linearGradientToDataUri()`
  (`src/lib/export/pdf-gradient.ts`) builds a tiny inline SVG reproducing the
  same gradient, rasterizes it to a PNG via `sharp` (PDFKit, which
  `@react-pdf/renderer` wraps, only decodes JPEG/PNG raster bytes — SVG data
  URIs crash it), and passes the result to `ImageBackground` as a base64
  data URI.

This avoids maintaining a second, hand-authored image asset per template —
one data source, three consumers — and needs no stock photography or
externally-licensed images (an explicit constraint for this stage: CSS/SVG-
generated patterns only, no images with unclear commercial-use rights).

Radial gradients are **not** reproduced in the PDF renderer — react-pdf has
no radial-gradient primitive, and no rotate/scale trick reproduces one
convincingly on a fixed rectangular page — so a template with
`background.type === "radial-gradient"` falls back to the default neutral
page background in PDF specifically (DOM and PNG render it correctly).

### Text color

`resolvePageForeground(background)` derives body/secondary/divider text
colors from the background: no custom background keeps the exact
pre-Stage-13 neutral tokens (`#171717` / `#525252` / `#e5e5e5`); a custom
background picks white or near-black text via
`pickReadableTextColor(background.colors[0])`, with secondary/divider as
translucent tints of that choice.

## Render pipeline

Three renderers consume the same `ResolvedMenuStyle`
(`resolveTemplateDefaults(config)` + `resolveEffectiveStyle(...)` layering
`style_overrides` on top):

| Renderer           | Entry point                                                | Notes                                                                                                                                     |
| ------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| DOM / live-preview | `MenuStaticView` / `MenuLivePreview` → `MenuCategoryShell` | Real CSS custom properties (`--menu-accent`, `--menu-heading-font`, etc.) set once on the wrapper, consumed via `var()` deep in the tree. |
| PNG                | `src/lib/export/render-menu-png.tsx`                       | Satori (via Next's `ImageResponse`) — inline styles only, no CSS custom properties, no Tailwind classes.                                  |
| PDF                | `src/lib/export/render-menu-pdf.tsx`                       | `@react-pdf/renderer`'s React-Native-like `StyleSheet` — a different constrained subset again.                                            |

Both export renderers deliberately duplicate the DOM's JSX structure rather
than sharing components with it — Satori and react-pdf each understand only
their own constrained style subset (see the doc comments at the top of each
file for what's supported/unsupported), so "one JSX tree, three targets" was
not viable. What's shared is the _data_ (one `ResolvedMenuStyle`, one
`TemplateBackground`) and the _visual intent_, verified by eye against the
DOM rendering for every template.

## Known limitations (by renderer)

- **PDF**: no `box-shadow` (`cardShadow` has no visible effect); no
  radial-gradient (falls back to neutral background); single-column layout
  regardless of a menu's `columns` setting (a pre-Stage-13 constraint —
  `@react-pdf/renderer` paginates by measuring vertical flow, and parallel
  flex columns of uneven height don't reliably continue in alignment across
  a page break).
- **PNG**: no pagination — a pathological content size (very large menus)
  is capped rather than clipped (`MAX_HEIGHT` in `render-menu-png.tsx`), but
  extremely long content will still produce a very tall image.

## Two react-pdf rendering bugs found during implementation

Both reproduced in isolation before being fixed — worth documenting since
they're non-obvious and would resurface if a future template config is
built without this context:

1. **`rgba()` in `border`/`borderColor` renders as solid red instead of the
   translucent color.** Reproduced with both the `border` shorthand and the
   `borderColor` longhand — it's not a shorthand-parsing issue, the stroke
   path itself doesn't handle alpha (fill/`color` with `rgba()` works fine —
   only stroke is affected). Fixed by alpha-compositing the translucent
   divider color onto the background's first solid color to get an
   equivalent opaque hex (`compositeRgbaOnHex` in `render-menu-pdf.tsx`).
2. **A per-corner `borderRadius` shorthand string (`"20px 20px 0 0"`) paints
   a solid black block over the element instead of applying the radius.**
   Reproduced on both `Text` and `View` nodes — the longhand
   `borderTopLeftRadius` / `borderTopRightRadius` properties do not have
   this bug. Fixed by using the longhand form for the `solid-bar` category
   header (the only place a per-corner radius is needed — every other
   rounded element in this design uses a uniform radius, which works fine
   with the plain `borderRadius` shorthand).

## Public menu page and RLS

The public web/QR menu page (`/m/[slug]`) is visited by anonymous customers
and must read the menu's template `config` to render. `menu_templates`' RLS
originally only granted `SELECT` to `authenticated` — see migration
`20260715110000_menu_templates_anon_select.sql`, which adds an anon
`SELECT` policy scoped to `is_active = true` templates.

## Per-template config rationale

Coffee Shop and Luxury (`20260715100000_template_visual_redesign_poc.sql`)
were built first as a deliberately contrastive proof-of-concept — warm/
light/rounded/friendly vs. dark/gold/sharp/formal — to validate the config
shape and full render pipeline before extending to the remaining 10
(`20260715120000_template_visual_redesign_remaining10.sql`).

Luxury's accent color was changed from its pre-Stage-13 `charcoal` to
`golden-amber` as part of that redesign: the template now paints its own
near-black page background, and a charcoal accent bar/underline would have
had almost no contrast against it. Gold reads as the classic luxury pairing
against near-black and stays legible. `bar` (also a dark-background
template) deliberately uses `categoryHeaderStyle: "solid-bar"` rather than
`"underline"` for the same class of reason — solid-bar auto-contrasts its
text via `pickReadableTextColor` regardless of page background, sidestepping
the question of whether `bar`'s existing `royal-purple` accent is legible as
raw text color against its dark background.

Header-style and background-type coverage is deliberately spread across all
12 templates rather than concentrated, so every code path gets exercised by
more than one template: `solid-bar` (coffee-shop, pizza, burger, modern,
bar, dark), `underline` (restaurant, sushi, minimal), `boxed-outline`
(luxury, bakery, elegant); background types solid (restaurant, burger),
linear-gradient (coffee-shop, pizza, bakery, bar, modern, luxury, elegant,
dark), radial-gradient (sushi), and `null`/no override (minimal — literal
minimalism, matching the template's premise).
