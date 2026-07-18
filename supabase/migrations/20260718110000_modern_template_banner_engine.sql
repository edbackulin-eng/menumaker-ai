-- Stage 2 final: the Modern template switches to the `banner-two-column`
-- layout engine — the first render tree that isn't the shared "classic"
-- one (see MenuLayoutEngine in src/lib/utils/resolve-menu-style.ts).
--
-- Only this one row changes. Every other template keeps no `layoutEngine`
-- key at all, and resolveTemplateDefaults() reads a missing key as
-- "classic", so the remaining 11 render byte-identically — the same
-- backward-compatibility contract the Stage 13 fields were given.
--
-- The engine paints its own charcoal/gold palette from MODERN_PALETTE
-- rather than from these fields, so `background`, `defaultAccentColorId`
-- and `categoryHeaderStyle` no longer drive anything for this template.
-- `background` is cleared to null instead of being left as a stale
-- gradient: leaving it would imply the engine reads it, and would also
-- feed a gradient to the PDF renderer that cannot render one, if a future
-- change ever routed this template back through the classic tree.
--
-- Fonts *are* still read from here: the engine resolves
-- `var(--menu-heading-font)` for the venue name, category headings and
-- prices, so headingFontId must be the serif the reference specifies.
-- Playfair Display ships a cyrillic subset (src/lib/fonts/menu-fonts.ts)
-- and already has a registered TTF for the PDF renderer, so Ukrainian menu
-- titles keep working.
update public.menu_templates
set config = jsonb_build_object(
  'layoutEngine', 'banner-two-column',
  -- Badge rendering is config-gated so noisy analyzeMenu output can be
  -- switched off without a migration or a schema change (agreed with the
  -- PO when `badges` was added to menuItemSchema).
  'showBadges', true,
  'defaultFontId', 'inter',
  'headingFontId', 'playfair-display',
  'defaultColumns', 2,
  'defaultAccentColorId', 'charcoal',
  'background', null,
  'categoryHeaderStyle', 'underline',
  'categoryNameTransform', 'none',
  'cornerRadius', 'rounded',
  'cardShadow', false
)
where slug = 'modern';
