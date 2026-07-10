-- Atomic helpers around auth_rate_limits, so a login rate-limit check/record
-- is a single statement (no read-modify-write race between concurrent
-- requests for the same key, which plain SELECT-then-UPDATE from the app
-- layer would be vulnerable to).
--
-- service_role only — these exist so the backend can rate-limit login
-- attempts; a client must never be able to call them directly (that would
-- let an attacker probe or clear their own lockout).

create function public.is_login_locked(p_key text)
returns table (locked boolean, retry_after_seconds int)
language sql
stable
security definer
set search_path = public
as $$
  select
    locked_until is not null and locked_until > now(),
    greatest(0, ceil(extract(epoch from (locked_until - now())))::int)
  from public.auth_rate_limits
  where key = p_key;
$$;

revoke all on function public.is_login_locked(text) from public;
grant execute on function public.is_login_locked(text) to service_role;

create function public.record_login_failure(
  p_key text,
  p_max_attempts int default 5,
  p_window_seconds int default 900,
  p_lockout_seconds int default 900
)
returns table (attempt_count int, locked_until timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  insert into public.auth_rate_limits as t (key, attempt_count, first_attempt_at, locked_until)
  values (p_key, 1, now(), null)
  on conflict (key) do update set
    attempt_count = case
      when t.first_attempt_at < now() - make_interval(secs => p_window_seconds) then 1
      else t.attempt_count + 1
    end,
    first_attempt_at = case
      when t.first_attempt_at < now() - make_interval(secs => p_window_seconds) then now()
      else t.first_attempt_at
    end,
    locked_until = case
      when t.first_attempt_at < now() - make_interval(secs => p_window_seconds) then null
      when t.attempt_count + 1 >= p_max_attempts then now() + make_interval(secs => p_lockout_seconds)
      else t.locked_until
    end
  returning t.attempt_count, t.locked_until;
end;
$$;

revoke all on function public.record_login_failure(text, int, int, int) from public;
grant execute on function public.record_login_failure(text, int, int, int) to service_role;

create function public.record_login_success(p_key text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.auth_rate_limits where key = p_key;
$$;

revoke all on function public.record_login_success(text) from public;
grant execute on function public.record_login_success(text) to service_role;
