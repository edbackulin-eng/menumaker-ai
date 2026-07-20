-- Stage 3: the `classic-elegant` (Bistro) layout engine's templates — a
-- dense, photo-free, serif fine-dining card. Two presets differing only by
-- palette (the mechanism menu_templates.palette exists for), each pointed
-- at the venue types a long typographic menu suits.
--
-- Playfair Display (the one curated serif with a Cyrillic subset, and the
-- face Modern already sets prices in) is the heading font; PT Sans is the
-- humanist-sans body. showBadges is off: this engine renders no badges —
-- a fine-dining card lists dishes as prose, not tagged rows.

insert into public.menu_templates (slug, name, category, engine, business_types, config, palette, sort_order, is_active)
values
  (
    'bistro-cream',
    jsonb_build_object('en', 'Bistro', 'uk', 'Бістро'),
    'style',
    'classic-elegant',
    '{restaurant,cafe,coffeehouse}',
    jsonb_build_object('defaultFontId', 'pt-sans', 'headingFontId', 'playfair-display', 'showBadges', false),
    jsonb_build_object(
      'page', '#f7f3ea',
      'text', '#221e18',
      'textMuted', '#6b6357',
      'accent', '#9c7c3c',
      'rule', '#d8cfbc',
      'footerText', '#6b6357',
      'footerRule', '#d8cfbc'
    ),
    15,
    true
  ),
  (
    'bistro-noir',
    jsonb_build_object('en', 'Bistro Noir', 'uk', 'Бістро Нуар'),
    'style',
    'classic-elegant',
    '{restaurant,bar}',
    jsonb_build_object('defaultFontId', 'pt-sans', 'headingFontId', 'playfair-display', 'showBadges', false),
    jsonb_build_object(
      'page', '#1a1815',
      'text', '#efe8da',
      'textMuted', '#a99f8d',
      'accent', '#c9a86a',
      'rule', '#3a352c',
      'footerText', '#a99f8d',
      'footerRule', '#3a352c'
    ),
    16,
    true
  )
on conflict (slug) do nothing;
