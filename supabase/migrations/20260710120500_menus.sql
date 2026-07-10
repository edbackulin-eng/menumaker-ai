-- menus: the core user-owned menu record.
create table public.menus (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  template_id uuid references public.menu_templates (id) on delete set null,
  title text not null,
  status public.menu_status not null default 'draft',
  source_type public.menu_source_type not null default 'manual',
  original_file_url text,
  content jsonb not null default '{}'::jsonb,
  locale text not null default 'en',
  is_public boolean not null default false,
  public_slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A public web/QR menu is reachable by its slug; guarantee one exists
  -- whenever a menu is actually marked public.
  constraint menus_public_requires_slug check (not is_public or public_slug is not null)
);

create index menus_user_id_idx on public.menus (user_id);
create index menus_template_id_idx on public.menus (template_id);
create index menus_status_idx on public.menus (status);

create trigger set_menus_updated_at
  before update on public.menus
  for each row
  execute function public.set_updated_at();

alter table public.menus enable row level security;

-- No `TO` clause: applies to every role (anon included). For anon,
-- auth.uid() is null, so user_id = auth.uid() and is_admin() both evaluate
-- to false/not-true — only is_public = true rows are visible, which is
-- exactly the public web/QR menu use case.
create policy "menus_select_public_or_own_or_admin"
  on public.menus for select
  using (is_public = true or user_id = auth.uid() or public.is_admin());

create policy "menus_insert_own_or_admin"
  on public.menus for insert
  to authenticated
  with check (user_id = auth.uid() or public.is_admin());

create policy "menus_update_own_or_admin"
  on public.menus for update
  to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "menus_delete_own_or_admin"
  on public.menus for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

grant select on public.menus to anon;
grant select, insert, update, delete on public.menus to authenticated;
grant all on public.menus to service_role;

-- Deferred FK from credits_transactions (created in 20260710120300, before
-- menus existed). See the comment on that table for why this is split out.
alter table public.credits_transactions
  add constraint credits_transactions_related_menu_id_fkey
  foreign key (related_menu_id) references public.menus (id) on delete set null;
