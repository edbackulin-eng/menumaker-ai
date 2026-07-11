-- Interactive editor (Stage 7.5): user-chosen presentation on top of the
-- template's defaults. Kept as its own column, not folded into `content` —
-- `content` is *what the menu contains* (categories/items/prices, owned by
-- the AI-analysis/Review pipeline from Stage 6/7); `style_overrides` is
-- *how it looks* (colors/font/layout/display order), an orthogonal concern
-- edited by a completely different flow (the style editor, no AI involved).
-- Mirrors the existing precedent of `template_id` already being a separate
-- column rather than embedded in `content`.
alter table public.menus
  add column style_overrides jsonb not null default '{}'::jsonb;

-- menu_templates.config (Stage 2) was seeded as `{}` on all 12 rows,
-- deliberately deferred ("stays {} until the UI Design System stage defines
-- its structure" — see 20260710120400_menu_templates.sql / seed.sql). This
-- is that stage: `style_overrides` (see src/config/menu-style.ts for the
-- curated ids referenced below) layers on top of these per-template
-- defaults rather than replacing them. Values chosen to loosely match each
-- template's existing name/category, not a deep visual redesign (out of
-- scope this stage) — just sensible starting points.
update public.menu_templates set config = '{"defaultAccentColorId":"golden-amber","defaultFontId":"pt-sans","defaultColumns":1}'::jsonb where slug = 'coffee-shop';
update public.menu_templates set config = '{"defaultAccentColorId":"forest-green","defaultFontId":"playfair-display","defaultColumns":2}'::jsonb where slug = 'restaurant';
update public.menu_templates set config = '{"defaultAccentColorId":"sunset-orange","defaultFontId":"rubik","defaultColumns":2}'::jsonb where slug = 'pizza';
update public.menu_templates set config = '{"defaultAccentColorId":"charcoal","defaultFontId":"montserrat","defaultColumns":2}'::jsonb where slug = 'sushi';
update public.menu_templates set config = '{"defaultAccentColorId":"sunset-orange","defaultFontId":"oswald","defaultColumns":1}'::jsonb where slug = 'burger';
update public.menu_templates set config = '{"defaultAccentColorId":"golden-amber","defaultFontId":"manrope","defaultColumns":1}'::jsonb where slug = 'bakery';
update public.menu_templates set config = '{"defaultAccentColorId":"royal-purple","defaultFontId":"oswald","defaultColumns":1}'::jsonb where slug = 'bar';
update public.menu_templates set config = '{"defaultAccentColorId":"charcoal","defaultFontId":"playfair-display","defaultColumns":1}'::jsonb where slug = 'luxury';
update public.menu_templates set config = '{"defaultAccentColorId":"ocean-blue","defaultFontId":"inter","defaultColumns":2}'::jsonb where slug = 'modern';
update public.menu_templates set config = '{"defaultAccentColorId":"charcoal","defaultFontId":"inter","defaultColumns":1}'::jsonb where slug = 'minimal';
update public.menu_templates set config = '{"defaultAccentColorId":"rose-red","defaultFontId":"playfair-display","defaultColumns":1}'::jsonb where slug = 'elegant';
update public.menu_templates set config = '{"defaultAccentColorId":"teal","defaultFontId":"montserrat","defaultColumns":2}'::jsonb where slug = 'dark';
