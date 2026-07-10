-- menu_templates: catalog of selectable menu designs (Coffee Shop,
-- Restaurant, Pizza, ...). `config` (colors/fonts/layout) is intentionally
-- an untyped jsonb blob for now — its structure is defined in the UI Design
-- System stage.
create table public.menu_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null default '{}'::jsonb,
  category text not null,
  preview_image_url text,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index menu_templates_category_idx on public.menu_templates (category);
create index menu_templates_is_active_idx on public.menu_templates (is_active);

create trigger set_menu_templates_updated_at
  before update on public.menu_templates
  for each row
  execute function public.set_updated_at();

alter table public.menu_templates enable row level security;

-- Per spec: readable by any authenticated user, not anonymous visitors.
-- (Worth revisiting if the marketing site needs to showcase templates to
-- signed-out visitors — that would need a separate anon SELECT policy.)
create policy "menu_templates_select_authenticated"
  on public.menu_templates for select
  to authenticated
  using (true);

create policy "menu_templates_write_admin_only"
  on public.menu_templates for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on public.menu_templates to authenticated;
grant all on public.menu_templates to service_role;
