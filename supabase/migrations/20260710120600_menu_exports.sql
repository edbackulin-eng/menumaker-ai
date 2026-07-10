-- menu_exports: history of PDF/PNG/Web/QR exports, for tracking and future
-- usage analytics.
create table public.menu_exports (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menus (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  export_type public.menu_export_type not null,
  file_url text,
  created_at timestamptz not null default now()
);

create index menu_exports_menu_id_idx on public.menu_exports (menu_id);
create index menu_exports_user_id_idx on public.menu_exports (user_id);
create index menu_exports_export_type_idx on public.menu_exports (export_type);

alter table public.menu_exports enable row level security;

create policy "menu_exports_select_own_or_admin"
  on public.menu_exports for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Unlike credits_transactions/payments, export events are logged by the
-- owning user's own request (e.g. clicking "Download PDF"), not exclusively
-- by trusted backend code, so authenticated users may insert their own
-- rows. There is intentionally no UPDATE policy — export records are
-- write-once; only an admin can delete one (moderation/cleanup).
create policy "menu_exports_insert_own_or_admin"
  on public.menu_exports for insert
  to authenticated
  with check (user_id = auth.uid() or public.is_admin());

create policy "menu_exports_delete_admin_only"
  on public.menu_exports for delete
  to authenticated
  using (public.is_admin());

grant select, insert, delete on public.menu_exports to authenticated;
grant all on public.menu_exports to service_role;
