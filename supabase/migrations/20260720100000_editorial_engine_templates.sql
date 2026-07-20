-- Stage 3: the `editorial` layout engine's templates — a single-column
-- magazine feature spread with a full-width hero photo per category, the
-- largest imagery any engine shows. Two presets differing by palette, each
-- pointed at the venue types an image-led authorial menu suits.
--
-- Playfair Display is the display face for the big masthead and category
-- headings; PT Sans is the body. showBadges is off — an editorial spread
-- reads as prose under its hero photo, not as tagged rows.

insert into public.menu_templates (slug, name, category, engine, business_types, config, palette, sort_order, is_active)
values
  (
    'editorial-gallery',
    jsonb_build_object('en', 'Editorial', 'uk', 'Журнал'),
    'style',
    'editorial',
    '{restaurant,cafe,coffeehouse}',
    jsonb_build_object('defaultFontId', 'pt-sans', 'headingFontId', 'playfair-display', 'showBadges', false),
    jsonb_build_object(
      'page', '#fcfbf9',
      'text', '#1a1a1a',
      'textMuted', '#5f5b55',
      'accent', '#b0472b',
      'rule', '#e4e0d8',
      'heroPlaceholder', '#e8e3d8',
      'footerText', '#5f5b55',
      'footerRule', '#e4e0d8'
    ),
    17,
    true
  ),
  (
    'editorial-ink',
    jsonb_build_object('en', 'Editorial Ink', 'uk', 'Журнал Нуар'),
    'style',
    'editorial',
    '{restaurant,bar}',
    jsonb_build_object('defaultFontId', 'pt-sans', 'headingFontId', 'playfair-display', 'showBadges', false),
    jsonb_build_object(
      'page', '#141414',
      'text', '#f4f1ec',
      'textMuted', '#a8a29a',
      'accent', '#e0855a',
      'rule', '#2e2e2e',
      'heroPlaceholder', '#262626',
      'footerText', '#a8a29a',
      'footerRule', '#2e2e2e'
    ),
    18,
    true
  )
on conflict (slug) do nothing;
