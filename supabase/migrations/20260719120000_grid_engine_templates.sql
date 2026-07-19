-- Stage 3: the `grid` layout engine's templates — photo-led tiles, for
-- venues whose food sells by the picture. Three presets that differ by
-- palette (the whole reason menu_templates.palette exists), each pointed at
-- the venue types that suit a photo grid.
--
-- The `grid` engine paints from menu_templates.palette via parseGridPalette;
-- an absent key inherits GRID_PALETTE_DEFAULT, so each preset only restates
-- the colors that give it its identity. `config` carries the same
-- font-selection fields the classic engine's resolver reads (the grid
-- engine reads fontId/headingFontId through the shared ResolvedMenuStyle),
-- so a heading font pairing is set here too.
--
-- showBadges is on: a photo menu is exactly where "vegetarian"/"chef's
-- pick" pills earn their place.

insert into public.menu_templates (slug, name, category, engine, business_types, config, palette, sort_order, is_active)
values
  (
    'grid-burger',
    jsonb_build_object('en', 'Burger Grid', 'uk', 'Бургер-сітка'),
    'cuisine',
    'grid',
    '{restaurant,bar}',
    jsonb_build_object('defaultFontId', 'inter', 'headingFontId', 'oswald', 'showBadges', true),
    jsonb_build_object(
      'page', '#181513',
      'card', '#221d19',
      'cardBorder', '#332b24',
      'text', '#f6f1ea',
      'textMuted', '#a89a8b',
      'accent', '#e0952b',
      'accentBorder', '#5c4620',
      'badgeVeg', '#8fbf7a',
      'badgeVegBorder', '#3f5236',
      'footer', '#141110',
      'footerBorder', '#2a231e',
      'footerText', '#8a7f73'
    ),
    12,
    true
  ),
  (
    'grid-pizza',
    jsonb_build_object('en', 'Pizza Grid', 'uk', 'Піца-сітка'),
    'cuisine',
    'grid',
    '{restaurant}',
    jsonb_build_object('defaultFontId', 'rubik', 'headingFontId', 'montserrat', 'showBadges', true),
    jsonb_build_object(
      'page', '#fbf7f0',
      'card', '#ffffff',
      'cardBorder', '#ece2d4',
      'text', '#20180f',
      'textMuted', '#6f6152',
      'accent', '#c1381f',
      'accentBorder', '#e8b9ae',
      'footer', '#f2ebe0',
      'footerBorder', '#e2d8c8',
      'footerText', '#6f6152'
    ),
    13,
    true
  ),
  (
    'grid-fresh',
    jsonb_build_object('en', 'Fresh Grid', 'uk', 'Свіжа сітка'),
    'cuisine',
    'grid',
    '{cafe,coffeehouse,bakery}',
    jsonb_build_object('defaultFontId', 'manrope', 'headingFontId', 'manrope', 'showBadges', true),
    jsonb_build_object(
      'page', '#f6faf6',
      'card', '#ffffff',
      'cardBorder', '#dfeadf',
      'text', '#16261a',
      'textMuted', '#5c6b5f',
      'accent', '#2f8f4e',
      'accentBorder', '#b6dcc0',
      'footer', '#eaf3ea',
      'footerBorder', '#d8e6d8',
      'footerText', '#5c6b5f'
    ),
    14,
    true
  )
on conflict (slug) do nothing;
