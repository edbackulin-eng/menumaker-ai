-- Stage 10 (Admin Panel).

-- admin_audit_log: durable trail of sensitive admin actions (role changes,
-- manual credit grants). Written exclusively by the SECURITY DEFINER
-- functions below, running as their owner — never directly by any session,
-- admin included, so the trail can't be edited after the fact even by the
-- admin who performed the action.
create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id) on delete cascade,
  action text not null,
  target_user_id uuid references public.profiles (id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_log_admin_id_idx on public.admin_audit_log (admin_id);
create index admin_audit_log_target_user_id_idx on public.admin_audit_log (target_user_id);
create index admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);

alter table public.admin_audit_log enable row level security;

create policy "admin_audit_log_select_admin_only"
  on public.admin_audit_log for select
  to authenticated
  using (public.is_admin());

grant select on public.admin_audit_log to authenticated;
grant all on public.admin_audit_log to service_role;

-- Atomic role change + audit entry. `p_admin_id = p_target_user_id` is
-- blocked outright — an admin accidentally demoting themselves would lock
-- them out of the panel with no other admin around to undo it.
create function public.admin_change_user_role(
  p_admin_id uuid,
  p_target_user_id uuid,
  p_new_role public.user_role
)
returns table (old_role public.user_role, new_role public.user_role)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_role public.user_role;
begin
  if p_target_user_id = p_admin_id then
    raise exception 'Адмін не може змінити власну роль.';
  end if;

  select role into v_old_role from public.profiles where id = p_target_user_id for update;
  if not found then
    raise exception 'Користувача не знайдено.';
  end if;

  update public.profiles set role = p_new_role where id = p_target_user_id;

  insert into public.admin_audit_log (admin_id, action, target_user_id, details)
  values (
    p_admin_id,
    'role_change',
    p_target_user_id,
    jsonb_build_object('old_role', v_old_role, 'new_role', p_new_role)
  );

  return query select v_old_role, p_new_role;
end;
$$;

revoke all on function public.admin_change_user_role(uuid, uuid, public.user_role) from public;
grant execute on function public.admin_change_user_role(uuid, uuid, public.user_role) to service_role;

-- Atomic manual credit grant (support/refund gestures) + ledger entry +
-- audit entry. Mirrors spend_credits()'s shape (Stage 6) but adds instead
-- of subtracts, and requires a non-empty reason — an unattributed credit
-- grant is exactly the kind of entry a future support/finance review would
-- need explained.
create function public.admin_grant_credits(
  p_admin_id uuid,
  p_target_user_id uuid,
  p_amount int,
  p_reason text
)
returns table (new_balance int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance int;
begin
  if p_amount <= 0 then
    raise exception 'Кількість кредитів для нарахування має бути додатною.';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Причина нарахування є обов''язковою.';
  end if;

  update public.credits_balance
  set balance = balance + p_amount
  where user_id = p_target_user_id
  returning balance into v_new_balance;

  if not found then
    raise exception 'Баланс користувача не знайдено.';
  end if;

  insert into public.credits_transactions (user_id, amount, type, description)
  values (p_target_user_id, p_amount, 'admin_grant', p_reason);

  insert into public.admin_audit_log (admin_id, action, target_user_id, details)
  values (
    p_admin_id,
    'credit_grant',
    p_target_user_id,
    jsonb_build_object('amount', p_amount, 'reason', p_reason, 'new_balance', v_new_balance)
  );

  return query select v_new_balance;
end;
$$;

revoke all on function public.admin_grant_credits(uuid, uuid, int, text) from public;
grant execute on function public.admin_grant_credits(uuid, uuid, int, text) to service_role;

-- Headline dashboard metrics in one round trip, rather than 7 separate
-- count() queries from the Route Handler.
create function public.admin_dashboard_stats()
returns table (
  total_users int,
  new_users_today int,
  new_users_week int,
  new_users_month int,
  total_menus int,
  free_trials_used int,
  conversion_pct numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.profiles)::int,
    (select count(*) from public.profiles where created_at >= date_trunc('day', now()))::int,
    (select count(*) from public.profiles where created_at >= now() - interval '7 days')::int,
    (select count(*) from public.profiles where created_at >= now() - interval '30 days')::int,
    (select count(*) from public.menus)::int,
    (select count(*) from public.credits_balance where free_menus_used > 0)::int,
    case when (select count(*) from public.profiles) = 0 then 0::numeric
    else round(
      (select count(distinct user_id) from public.menus)::numeric
      / (select count(*) from public.profiles)::numeric * 100, 1
    ) end;
$$;

revoke all on function public.admin_dashboard_stats() from public;
grant execute on function public.admin_dashboard_stats() to service_role;

-- One row per day for the last `p_days` days (default 30), zero-filled via
-- generate_series so the chart doesn't have gaps on days with no activity.
create function public.admin_daily_activity(p_days int default 30)
returns table (day date, new_users int, new_menus int)
language sql
stable
security definer
set search_path = public
as $$
  select
    d::date as day,
    coalesce(u.cnt, 0)::int as new_users,
    coalesce(m.cnt, 0)::int as new_menus
  from generate_series(current_date - (greatest(p_days, 1) - 1), current_date, interval '1 day') as d
  left join (
    select date_trunc('day', created_at)::date as day, count(*) as cnt
    from public.profiles
    group by 1
  ) u on u.day = d::date
  left join (
    select date_trunc('day', created_at)::date as day, count(*) as cnt
    from public.menus
    group by 1
  ) m on m.day = d::date
  order by d;
$$;

revoke all on function public.admin_daily_activity(int) from public;
grant execute on function public.admin_daily_activity(int) to service_role;

-- Credits ledger grouped by type — which AI actions actually get used, and
-- how granted-vs-spent nets out.
create function public.admin_credits_breakdown()
returns table (type public.credit_transaction_type, total_amount bigint, transaction_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select type, sum(amount)::bigint, count(*)::bigint
  from public.credits_transactions
  group by type
  order by type;
$$;

revoke all on function public.admin_credits_breakdown() from public;
grant execute on function public.admin_credits_breakdown() to service_role;

-- profiles.locale breakdown (Statistics page) — a rough proxy for user
-- geography ahead of real i18n (Stage 8's profile.locale field, editable
-- since then but not yet driving any UI translation).
create function public.admin_locale_breakdown()
returns table (locale text, user_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select locale, count(*)::bigint as user_count
  from public.profiles
  group by locale
  order by user_count desc;
$$;

revoke all on function public.admin_locale_breakdown() from public;
grant execute on function public.admin_locale_breakdown() to service_role;

-- Registration source (email vs Google OAuth) — reads auth.users directly
-- (not exposed via PostgREST/public schema) because provider is Supabase
-- Auth's own bookkeeping, not something we duplicate into public.profiles.
create function public.admin_registration_source_breakdown()
returns table (provider text, user_count bigint)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    coalesce(raw_app_meta_data->>'provider', 'email') as provider,
    count(*)::bigint as user_count
  from auth.users
  group by provider
  order by user_count desc;
$$;

revoke all on function public.admin_registration_source_breakdown() from public;
grant execute on function public.admin_registration_source_breakdown() to service_role;

-- Searchable/filterable/paginated user list for the Users page. A SQL
-- function rather than PostgREST embedding: joining profiles with an
-- aggregated menu count and a `count(*) over()` total for pagination is
-- awkward to express reliably through supabase-js's embedded-resource
-- syntax, whereas this is one predictable round trip.
create function public.admin_list_users(
  p_search text default null,
  p_role public.user_role default null,
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid,
  email text,
  full_name text,
  role public.user_role,
  created_at timestamptz,
  free_menus_used int,
  credits_balance int,
  menu_count bigint,
  total_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with filtered as (
    select p.id, p.email, p.full_name, p.role, p.created_at,
           coalesce(cb.free_menus_used, 0) as free_menus_used,
           coalesce(cb.balance, 0) as credits_balance
    from public.profiles p
    left join public.credits_balance cb on cb.user_id = p.id
    where (p_search is null or p.email ilike '%' || p_search || '%' or p.full_name ilike '%' || p_search || '%')
      and (p_role is null or p.role = p_role)
  ),
  counted as (
    select *, count(*) over() as total_count from filtered
  )
  select
    c.id, c.email, c.full_name, c.role, c.created_at,
    c.free_menus_used, c.credits_balance,
    coalesce((select count(*) from public.menus m where m.user_id = c.id), 0) as menu_count,
    c.total_count
  from counted c
  order by c.created_at desc
  limit p_limit offset p_offset;
$$;

revoke all on function public.admin_list_users(text, public.user_role, int, int) from public;
grant execute on function public.admin_list_users(text, public.user_role, int, int) to service_role;

-- Filterable/paginated menu list for the Menus page, owner email joined in
-- (metadata only — content is never selected here, by design; see Stage 10
-- brief on not exposing other users' menu content to admins).
create function public.admin_list_menus(
  p_status public.menu_status default null,
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid,
  title text,
  status public.menu_status,
  owner_email text,
  template_id uuid,
  template_name jsonb,
  created_at timestamptz,
  total_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with filtered as (
    select m.id, m.title, m.status, p.email as owner_email, m.template_id, t.name as template_name, m.created_at
    from public.menus m
    join public.profiles p on p.id = m.user_id
    left join public.menu_templates t on t.id = m.template_id
    where p_status is null or m.status = p_status
  ),
  counted as (
    select *, count(*) over() as total_count from filtered
  )
  select * from counted
  order by created_at desc
  limit p_limit offset p_offset;
$$;

revoke all on function public.admin_list_menus(public.menu_status, int, int) from public;
grant execute on function public.admin_list_menus(public.menu_status, int, int) to service_role;
