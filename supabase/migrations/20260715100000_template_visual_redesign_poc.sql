-- Stage 13 (menu template visual redesign): proof-of-concept for the two
-- new `config` fields introduced alongside `TemplateBackground`,
-- `categoryHeaderStyle`, `cornerRadius`, `categoryNameTransform`, and
-- `cardShadow` (see src/lib/utils/resolve-menu-style.ts). Only these two
-- templates are updated here — the remaining 10 keep their pre-Stage-13
-- config shape (just the three original fields) until the POC is approved
-- and the approach is extended to them.
--
-- `defaultAccentColorId`/`defaultFontId` are also revised for `luxury`
-- (charcoal/playfair-display -> golden-amber/manrope): the template now
-- paints its own near-black page background, and a charcoal accent bar
-- would have almost no contrast against that background. Gold reads as the
-- classic luxury pairing against near-black and stays legible; the body
-- font moves to a clean sans (manrope) for readability at small sizes,
-- with the serif (playfair-display) reserved for headings via the new
-- `headingFontId` field — a real typographic pair instead of one font used
-- everywhere.

update public.menu_templates
set config = jsonb_build_object(
  'defaultAccentColorId', 'golden-amber',
  'defaultFontId', 'pt-sans',
  'defaultColumns', 1,
  'headingFontId', 'rubik',
  'background', jsonb_build_object(
    'type', 'linear-gradient',
    'colors', jsonb_build_array('#FDF6EC', '#F3E4CC'),
    'angleDeg', 160
  ),
  'categoryHeaderStyle', 'solid-bar',
  'cornerRadius', 'soft',
  'categoryNameTransform', 'none',
  'cardShadow', true
)
where slug = 'coffee-shop';

update public.menu_templates
set config = jsonb_build_object(
  'defaultAccentColorId', 'golden-amber',
  'defaultFontId', 'manrope',
  'defaultColumns', 1,
  'headingFontId', 'playfair-display',
  'background', jsonb_build_object(
    'type', 'linear-gradient',
    'colors', jsonb_build_array('#0D0D0D', '#1F1B16'),
    'angleDeg', 135
  ),
  'categoryHeaderStyle', 'boxed-outline',
  'cornerRadius', 'sharp',
  'categoryNameTransform', 'uppercase',
  'cardShadow', false
)
where slug = 'luxury';
