-- General-purpose API rate limiting (Stage 5), separate from
-- auth_rate_limits (Stage 4, a failed-login *lockout* counter with
-- different semantics). This is a fixed-window request counter: one row
-- per key (user id or IP), reused across windows via UPSERT — table size
-- is bounded by distinct users/IPs, not by request volume.
--
-- service_role only, same reasoning as auth_rate_limits: a client must
-- never be able to read or reset its own counter.
create table public.api_rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  request_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create trigger set_api_rate_limits_updated_at
  before update on public.api_rate_limits
  for each row
  execute function public.set_updated_at();

alter table public.api_rate_limits enable row level security;
-- No policies for anon/authenticated on purpose (default-deny).
grant all on public.api_rate_limits to service_role;

-- Atomic check-and-increment: single UPSERT so concurrent requests for the
-- same key can't race past the limit via a read-then-write gap.
create function public.check_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns table (allowed boolean, remaining int, retry_after_seconds int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
  v_window_start timestamptz;
begin
  insert into public.api_rate_limits as t (key, window_start, request_count)
  values (p_key, now(), 1)
  on conflict (key) do update set
    request_count = case
      when t.window_start < now() - make_interval(secs => p_window_seconds) then 1
      else t.request_count + 1
    end,
    window_start = case
      when t.window_start < now() - make_interval(secs => p_window_seconds) then now()
      else t.window_start
    end
  returning t.request_count, t.window_start into v_count, v_window_start;

  return query select
    v_count <= p_limit,
    greatest(0, p_limit - v_count),
    greatest(0, ceil(extract(epoch from (v_window_start + make_interval(secs => p_window_seconds) - now())))::int);
end;
$$;

revoke all on function public.check_rate_limit(text, int, int) from public;
grant execute on function public.check_rate_limit(text, int, int) to service_role;
