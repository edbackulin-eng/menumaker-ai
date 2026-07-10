-- Baseline reference data. Idempotent (ON CONFLICT DO NOTHING) so it's safe
-- to re-run against an environment that already has this data — real edits
-- made afterwards (e.g. via the future Admin Panel) are never overwritten
-- by re-seeding.

-- Orientation-only prices; Product Owner will tune these later via the
-- Admin Panel (Stage 10) without needing a deploy.
insert into public.credit_costs (action_type, cost, is_active)
values
  ('menu_generation', 1, true),
  ('menu_translation', 1, true),
  ('ai_description', 1, true),
  ('ai_improvement', 1, true)
on conflict (action_type) do nothing;

-- All 12 template slots from the design brief. `config` stays `{}` until
-- the UI Design System stage defines its structure.
insert into public.menu_templates (slug, name, category, sort_order)
values
  ('coffee-shop', jsonb_build_object('en', 'Coffee Shop', 'uk', 'Кав''ярня'), 'cuisine', 0),
  ('restaurant', jsonb_build_object('en', 'Restaurant', 'uk', 'Ресторан'), 'cuisine', 1),
  ('pizza', jsonb_build_object('en', 'Pizza', 'uk', 'Піцерія'), 'cuisine', 2),
  ('sushi', jsonb_build_object('en', 'Sushi', 'uk', 'Суші'), 'cuisine', 3),
  ('burger', jsonb_build_object('en', 'Burger', 'uk', 'Бургерна'), 'cuisine', 4),
  ('bakery', jsonb_build_object('en', 'Bakery', 'uk', 'Пекарня'), 'cuisine', 5),
  ('bar', jsonb_build_object('en', 'Bar', 'uk', 'Бар'), 'cuisine', 6),
  ('luxury', jsonb_build_object('en', 'Luxury', 'uk', 'Люкс'), 'style', 7),
  ('modern', jsonb_build_object('en', 'Modern', 'uk', 'Сучасний'), 'style', 8),
  ('minimal', jsonb_build_object('en', 'Minimal', 'uk', 'Мінімалізм'), 'style', 9),
  ('elegant', jsonb_build_object('en', 'Elegant', 'uk', 'Елегантний'), 'style', 10),
  ('dark', jsonb_build_object('en', 'Dark', 'uk', 'Темний'), 'style', 11)
on conflict (slug) do nothing;
