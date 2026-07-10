-- handle_new_user(): provisions public.profiles + public.credits_balance the
-- moment a row lands in auth.users — works for every signup method (email/
-- password, Google OAuth) since GoTrue always inserts into auth.users first.
-- SECURITY DEFINER is required: this fires as GoTrue's internal Postgres
-- role, which has no RLS-granted access to profiles/credits_balance, so the
-- function must run as its (table-owning) creator to bypass RLS.
--
-- locale is sourced from raw_user_meta_data->>'locale', which the app sets
-- from the Accept-Language header at signup time (see
-- src/features/auth/actions.ts). It's attacker-controllable (any client can
-- pass arbitrary signup metadata), so it's whitelisted against a simple
-- language-tag pattern here rather than trusted verbatim.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_locale text;
begin
  v_locale := new.raw_user_meta_data ->> 'locale';
  if v_locale is null or v_locale !~ '^[a-z]{2}(-[A-Z]{2})?$' then
    v_locale := 'en';
  end if;

  insert into public.profiles (id, email, full_name, avatar_url, locale)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    v_locale
  );

  -- free_menus_used starts at 0; the first 3 menus are free via that counter
  -- (see credits_balance in 20260710120300_credits.sql) — balance itself
  -- stays 0 until the user actually purchases credits (Stage 9).
  insert into public.credits_balance (user_id, balance, free_menus_used)
  values (new.id, 0, 0);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- auth_rate_limits: Postgres-backed brute-force lock for the login form.
-- Deliberately not an in-memory counter — that wouldn't work across
-- multiple serverless/server instances. Keyed by an arbitrary caller-chosen
-- string (src/lib/auth/rate-limit.ts uses `login:<normalized email>`).
-- Backend-only (service_role, which bypasses RLS) — never exposed to anon/
-- authenticated, so a client can't read or clear its own lockout.
create table public.auth_rate_limits (
  key text primary key,
  attempt_count integer not null default 0,
  first_attempt_at timestamptz not null default now(),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

create trigger set_auth_rate_limits_updated_at
  before update on public.auth_rate_limits
  for each row
  execute function public.set_updated_at();

alter table public.auth_rate_limits enable row level security;
-- No policies for anon/authenticated on purpose (default-deny). Only
-- service_role (which bypasses RLS entirely) touches this table.
grant all on public.auth_rate_limits to service_role;
