-- profiles: 1:1 extension of auth.users (Supabase Auth lands in Stage 4;
-- this table is only laid down now so later tables can reference it).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'user',
  locale text not null default 'en',
  -- Reserved for a future subscription feature (out of scope this stage).
  -- No triggers/logic attached to these columns beyond write-protection.
  subscription_status text,
  subscription_tier text,
  subscription_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- is_admin() centralizes the "is the current user an admin" check so it
-- isn't duplicated across every RLS policy in every table's migration.
-- SECURITY DEFINER + a pinned search_path lets it read public.profiles as
-- the function owner (which bypasses RLS), avoiding infinite recursion with
-- profiles' own RLS policies (which themselves call is_admin()). Must be
-- created here, after the table, because LANGUAGE SQL function bodies are
-- parse-validated against the catalog at CREATE FUNCTION time.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- Defense in depth beyond RLS: RLS's WITH CHECK can't compare a column's
-- new value against its *old* value, so a user could otherwise update their
-- own row and set role = 'admin', or grant themselves a subscription tier,
-- through an ordinary UPDATE they're already allowed to perform on their own
-- profile. This trigger blocks changes to privileged columns unless the
-- caller is an admin or the trusted backend (service_role).
create function public.protect_privileged_profile_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;

  if new.role is distinct from old.role
    or new.subscription_status is distinct from old.subscription_status
    or new.subscription_tier is distinct from old.subscription_tier
    or new.subscription_expires_at is distinct from old.subscription_expires_at
  then
    raise exception 'Insufficient privileges to modify protected profile fields';
  end if;

  return new;
end;
$$;

create trigger protect_privileged_profile_columns_trigger
  before update on public.profiles
  for each row
  execute function public.protect_privileged_profile_columns();

alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_own_or_admin"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "profiles_delete_admin_only"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
