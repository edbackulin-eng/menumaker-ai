-- RLS smoke test. Not a migration (not in supabase/migrations, never
-- applied by `db push`). Run with:
--   supabase db query --linked --file supabase/tests/rls_smoke_test.sql
--
-- Auth isn't wired up until Stage 4, so this simulates authenticated
-- requests directly at the SQL level (the standard technique: set the
-- `request.jwt.claims` GUC and switch to the `authenticated`/`anon` role —
-- the same values PostgREST would set from a real JWT).
--
-- Results are collected into a temp table and returned via a final SELECT
-- (client tools that run this often don't surface RAISE NOTICE output).
-- The whole script runs inside one transaction that is ALWAYS rolled back
-- at the end, so it never leaves test data behind, no matter the outcome.

begin;

create temporary table rls_test_results (
  seq serial primary key,
  check_name text not null,
  passed boolean not null,
  details text
);

-- The connecting role owns this temp table; the DO blocks below switch to
-- authenticated/anon to simulate API requests and need to write results too.
-- The `seq` serial column also needs its backing sequence grant.
grant insert on rls_test_results to authenticated, anon;
grant usage, select on rls_test_results_seq_seq to authenticated, anon;

-- --- Fixtures -----------------------------------------------------------
-- Minimal auth.users rows so profiles' FK to auth.users is satisfiable.
-- Values that don't matter for RLS purposes (password, tokens) are dummy.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'authenticated', 'authenticated', 'rls-test-user-a@example.com', 'not-a-real-hash',
   now(), now(), now(), '{"provider":"email"}', '{}', false, false),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'authenticated', 'authenticated', 'rls-test-user-b@example.com', 'not-a-real-hash',
   now(), now(), now(), '{"provider":"email"}', '{}', false, false),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   'authenticated', 'authenticated', 'rls-test-admin@example.com', 'not-a-real-hash',
   now(), now(), now(), '{"provider":"email"}', '{}', false, false);

insert into public.profiles (id, email, role) values
  ('11111111-1111-1111-1111-111111111111', 'rls-test-user-a@example.com', 'user'),
  ('22222222-2222-2222-2222-222222222222', 'rls-test-user-b@example.com', 'user'),
  ('33333333-3333-3333-3333-333333333333', 'rls-test-admin@example.com', 'admin');

insert into public.menus (id, user_id, title, is_public, public_slug) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'User A private menu', false, null),
  ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'User A public menu', true, 'user-a-public-menu');

-- --- Scenario 1: owner sees own private menu, stranger does not ---------
do $$
declare
  v_count int;
begin
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', '11111111-1111-1111-1111-111111111111', 'role', 'authenticated')::text, true);
  select count(*) into v_count from public.menus where id = 'aaaaaaaa-0000-0000-0000-000000000001';
  insert into rls_test_results (check_name, passed, details)
  values ('owner sees own private menu', v_count = 1, format('count=%s', v_count));

  perform set_config('request.jwt.claims', json_build_object('sub', '22222222-2222-2222-2222-222222222222', 'role', 'authenticated')::text, true);
  select count(*) into v_count from public.menus where id = 'aaaaaaaa-0000-0000-0000-000000000001';
  insert into rls_test_results (check_name, passed, details)
  values ('stranger cannot see other user''s private menu', v_count = 0, format('count=%s', v_count));
  reset role;
end $$;

-- --- Scenario 2: anonymous sees only the public menu ---------------------
do $$
declare
  v_public_count int;
  v_private_count int;
begin
  set local role anon;
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  select count(*) into v_public_count from public.menus where id = 'aaaaaaaa-0000-0000-0000-000000000002';
  select count(*) into v_private_count from public.menus where id = 'aaaaaaaa-0000-0000-0000-000000000001';
  insert into rls_test_results (check_name, passed, details)
  values (
    'anonymous sees public menu only',
    v_public_count = 1 and v_private_count = 0,
    format('public=%s private=%s', v_public_count, v_private_count)
  );
  reset role;
end $$;

-- --- Scenario 3: admin override sees everything --------------------------
do $$
declare
  v_count int;
begin
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', '33333333-3333-3333-3333-333333333333', 'role', 'authenticated')::text, true);
  select count(*) into v_count from public.menus where user_id = '11111111-1111-1111-1111-111111111111';
  insert into rls_test_results (check_name, passed, details)
  values ('admin sees both public and private menus of another user', v_count = 2, format('count=%s', v_count));
  reset role;
end $$;

-- --- Scenario 4: only admin can write menu_templates / credit_costs -----
do $$
begin
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', '11111111-1111-1111-1111-111111111111', 'role', 'authenticated')::text, true);
  begin
    insert into public.credit_costs (action_type, cost) values ('rls_test_action', 1);
    insert into rls_test_results (check_name, passed, details)
    values ('non-admin blocked from writing credit_costs', false, 'insert unexpectedly succeeded');
  exception when insufficient_privilege then
    insert into rls_test_results (check_name, passed, details)
    values ('non-admin blocked from writing credit_costs', true, null);
  end;
  reset role;

  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', '33333333-3333-3333-3333-333333333333', 'role', 'authenticated')::text, true);
  begin
    insert into public.credit_costs (action_type, cost) values ('rls_test_action', 1);
    insert into rls_test_results (check_name, passed, details)
    values ('admin can write credit_costs', true, null);
  exception when insufficient_privilege then
    insert into rls_test_results (check_name, passed, details)
    values ('admin can write credit_costs', false, 'insert unexpectedly blocked');
  end;
  reset role;
end $$;

-- --- Scenario 5: authenticated cannot write credits_transactions/payments
do $$
begin
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', '11111111-1111-1111-1111-111111111111', 'role', 'authenticated')::text, true);
  begin
    insert into public.credits_transactions (user_id, amount, type)
    values ('11111111-1111-1111-1111-111111111111', 100, 'bonus');
    insert into rls_test_results (check_name, passed, details)
    values ('authenticated blocked from writing credits_transactions', false, 'insert unexpectedly succeeded');
  exception when insufficient_privilege then
    insert into rls_test_results (check_name, passed, details)
    values ('authenticated blocked from writing credits_transactions', true, null);
  end;

  begin
    insert into public.payments (user_id, amount, credits_purchased)
    values ('11111111-1111-1111-1111-111111111111', 1000, 10);
    insert into rls_test_results (check_name, passed, details)
    values ('authenticated blocked from writing payments', false, 'insert unexpectedly succeeded');
  exception when insufficient_privilege then
    insert into rls_test_results (check_name, passed, details)
    values ('authenticated blocked from writing payments', true, null);
  end;
  reset role;
end $$;

-- --- Scenario 6: a user cannot self-promote to admin ---------------------
do $$
begin
  set local role authenticated;
  perform set_config('request.jwt.claims', json_build_object('sub', '11111111-1111-1111-1111-111111111111', 'role', 'authenticated')::text, true);
  begin
    update public.profiles set role = 'admin' where id = '11111111-1111-1111-1111-111111111111';
    insert into rls_test_results (check_name, passed, details)
    values ('user blocked from self-promoting to admin', false, 'update unexpectedly succeeded');
  exception when raise_exception then
    insert into rls_test_results (check_name, passed, details)
    values ('user blocked from self-promoting to admin', true, null);
  end;
  reset role;
end $$;

select
  case when passed then 'PASS' else 'FAIL' end as result,
  check_name,
  details
from rls_test_results
order by seq;

-- Nothing above is kept — this undoes the fixtures and every test write.
rollback;
