-- Stage 13 (menu template visual redesign), step 4: extends the approach
-- validated by the coffee-shop/luxury POC (20260715100000) to the
-- remaining 10 templates. `defaultAccentColorId`/`defaultFontId`/
-- `defaultColumns` are preserved from their existing (Stage 7.5) values —
-- only the 6 new Stage 13 fields are added.
--
-- Header-style distribution across all 12 templates is deliberately
-- spread rather than repeated: 6 solid-bar (coffee-shop, pizza, burger,
-- modern, bar, dark), 3 underline (restaurant, sushi, minimal), 3
-- boxed-outline (luxury, bakery, elegant) — every style gets exercised by
-- more than one template, and `underline` in particular gets its first
-- PNG/PDF export coverage here (the coffee-shop/luxury POC only exercised
-- solid-bar and boxed-outline).
--
-- Background-type coverage is likewise deliberate: linear-gradient
-- (pizza, burger, bakery, bar, modern, elegant, dark), solid
-- (restaurant, burger's warm off-white counterpart at bakery... see
-- individual rows), radial-gradient (sushi — also the first real content
-- to exercise the PDF renderer's documented radial-gradient fallback to a
-- neutral background), and `background: null` (minimal — literal
-- minimalism, no page-level styling at all, matching the template's
-- premise, and the first real content to exercise the pre-existing
-- opaqueCard/no-background path in combination with the 4 non-background
-- Stage 13 fields).
--
-- `royal-purple` (bar's existing accent) was kept solid-bar rather than
-- underline specifically because solid-bar auto-contrasts its text via
-- `pickReadableTextColor` regardless of page background — sidesteps
-- needing to separately verify raw accent-color-as-text legibility
-- against bar's dark background (the exact class of problem the
-- luxury POC's accent swap from charcoal to golden-amber solved).

update public.menu_templates
set config = jsonb_build_object(
  'defaultAccentColorId', 'forest-green',
  'defaultFontId', 'playfair-display',
  'defaultColumns', 2,
  'headingFontId', 'playfair-display',
  'background', jsonb_build_object(
    'type', 'solid',
    'colors', jsonb_build_array('#FAF6EF')
  ),
  'categoryHeaderStyle', 'underline',
  'cornerRadius', 'rounded',
  'categoryNameTransform', 'none',
  'cardShadow', false
)
where slug = 'restaurant';

update public.menu_templates
set config = jsonb_build_object(
  'defaultAccentColorId', 'sunset-orange',
  'defaultFontId', 'rubik',
  'defaultColumns', 2,
  'headingFontId', 'oswald',
  'background', jsonb_build_object(
    'type', 'linear-gradient',
    'colors', jsonb_build_array('#FFF4E8', '#FFE0C2'),
    'angleDeg', 145
  ),
  'categoryHeaderStyle', 'solid-bar',
  'cornerRadius', 'soft',
  'categoryNameTransform', 'uppercase',
  'cardShadow', true
)
where slug = 'pizza';

update public.menu_templates
set config = jsonb_build_object(
  'defaultAccentColorId', 'charcoal',
  'defaultFontId', 'montserrat',
  'defaultColumns', 2,
  'headingFontId', 'montserrat',
  'background', jsonb_build_object(
    'type', 'radial-gradient',
    'colors', jsonb_build_array('#FAFAF8', '#EDEBE6')
  ),
  'categoryHeaderStyle', 'underline',
  'cornerRadius', 'sharp',
  'categoryNameTransform', 'uppercase',
  'cardShadow', false
)
where slug = 'sushi';

update public.menu_templates
set config = jsonb_build_object(
  'defaultAccentColorId', 'sunset-orange',
  'defaultFontId', 'oswald',
  'defaultColumns', 1,
  'headingFontId', 'oswald',
  'background', jsonb_build_object(
    'type', 'solid',
    'colors', jsonb_build_array('#FFF8ED')
  ),
  'categoryHeaderStyle', 'solid-bar',
  'cornerRadius', 'soft',
  'categoryNameTransform', 'uppercase',
  'cardShadow', true
)
where slug = 'burger';

update public.menu_templates
set config = jsonb_build_object(
  'defaultAccentColorId', 'golden-amber',
  'defaultFontId', 'manrope',
  'defaultColumns', 1,
  'headingFontId', 'manrope',
  'background', jsonb_build_object(
    'type', 'linear-gradient',
    'colors', jsonb_build_array('#FFF9F0', '#FBEEDC'),
    'angleDeg', 170
  ),
  'categoryHeaderStyle', 'boxed-outline',
  'cornerRadius', 'soft',
  'categoryNameTransform', 'none',
  'cardShadow', true
)
where slug = 'bakery';

update public.menu_templates
set config = jsonb_build_object(
  'defaultAccentColorId', 'royal-purple',
  'defaultFontId', 'oswald',
  'defaultColumns', 1,
  'headingFontId', 'oswald',
  'background', jsonb_build_object(
    'type', 'linear-gradient',
    'colors', jsonb_build_array('#1A1025', '#2D1B3D'),
    'angleDeg', 135
  ),
  'categoryHeaderStyle', 'solid-bar',
  'cornerRadius', 'rounded',
  'categoryNameTransform', 'uppercase',
  'cardShadow', true
)
where slug = 'bar';

update public.menu_templates
set config = jsonb_build_object(
  'defaultAccentColorId', 'ocean-blue',
  'defaultFontId', 'inter',
  'defaultColumns', 2,
  'headingFontId', 'inter',
  'background', jsonb_build_object(
    'type', 'linear-gradient',
    'colors', jsonb_build_array('#F5FAFF', '#E8F2FC'),
    'angleDeg', 160
  ),
  'categoryHeaderStyle', 'solid-bar',
  'cornerRadius', 'rounded',
  'categoryNameTransform', 'none',
  'cardShadow', false
)
where slug = 'modern';

update public.menu_templates
set config = jsonb_build_object(
  'defaultAccentColorId', 'charcoal',
  'defaultFontId', 'inter',
  'defaultColumns', 1,
  'headingFontId', 'inter',
  'background', null,
  'categoryHeaderStyle', 'underline',
  'cornerRadius', 'sharp',
  'categoryNameTransform', 'none',
  'cardShadow', false
)
where slug = 'minimal';

update public.menu_templates
set config = jsonb_build_object(
  'defaultAccentColorId', 'rose-red',
  'defaultFontId', 'playfair-display',
  'defaultColumns', 1,
  'headingFontId', 'playfair-display',
  'background', jsonb_build_object(
    'type', 'linear-gradient',
    'colors', jsonb_build_array('#FDF3F3', '#FAE6E9'),
    'angleDeg', 150
  ),
  'categoryHeaderStyle', 'boxed-outline',
  'cornerRadius', 'rounded',
  'categoryNameTransform', 'uppercase',
  'cardShadow', true
)
where slug = 'elegant';

update public.menu_templates
set config = jsonb_build_object(
  'defaultAccentColorId', 'teal',
  'defaultFontId', 'montserrat',
  'defaultColumns', 2,
  'headingFontId', 'montserrat',
  'background', jsonb_build_object(
    'type', 'linear-gradient',
    'colors', jsonb_build_array('#0A1414', '#12201F'),
    'angleDeg', 135
  ),
  'categoryHeaderStyle', 'solid-bar',
  'cornerRadius', 'sharp',
  'categoryNameTransform', 'uppercase',
  'cardShadow', true
)
where slug = 'dark';
