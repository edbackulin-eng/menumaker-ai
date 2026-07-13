-- Stage 13 fix: the public web/QR menu page (app/m/[slug]) is visited by
-- anonymous customers scanning a table QR code and reads its menu's
-- template `config` (accent color, fonts, background, card treatment) to
-- render — but menu_templates' original RLS ("readable by any
-- authenticated user, not anonymous visitors", see 20260710120400) blocks
-- exactly that read for a signed-out visitor, silently returning no config
-- and falling back to the same generic default look for every template.
-- This was flagged as a known gap in that migration's own comment
-- ("Worth revisiting if the marketing site needs to showcase templates to
-- signed-out visitors") but stayed latent until Stage 13 gave templates
-- real, visually distinct configs to fall back away from. Scoped to
-- `is_active = true` only, matching how draft/inactive templates already
-- stay hidden from the authenticated-user template gallery.
create policy "menu_templates_select_anon_active"
  on public.menu_templates for select
  to anon
  using (is_active = true);

grant select on public.menu_templates to anon;
