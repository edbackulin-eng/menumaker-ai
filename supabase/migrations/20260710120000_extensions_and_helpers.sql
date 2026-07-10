-- Extensions, schema-level grants, and shared helper functions used by every
-- table's migration below.
--
-- Recent Supabase projects no longer auto-expose new `public` schema objects
-- to the Data API roles (anon/authenticated/service_role) — see the
-- `auto_expose_new_tables` note in supabase/config.toml. Every table and
-- function that needs to be reachable via the API must be granted
-- explicitly; RLS policies alone are not enough, they only filter rows
-- *after* the base GRANT already allows the operation.
grant usage on schema public to anon, authenticated, service_role;

-- gen_random_uuid() is built into PostgreSQL core since v13, no extension
-- needed on Supabase's Postgres (v15+).

-- Generic "touch updated_at" trigger function, reused by every table that
-- has an updated_at column.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- is_admin() lives in the profiles migration (20260710120200), not here:
-- it's a LANGUAGE SQL function, and unlike PL/pgSQL, SQL-language function
-- bodies are parse-analyzed against the catalog at CREATE FUNCTION time —
-- it cannot forward-reference public.profiles before that table exists.
