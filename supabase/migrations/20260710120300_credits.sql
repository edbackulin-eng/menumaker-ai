-- credits_balance: current balance per user, kept separate from the
-- transaction ledger so reads don't require aggregating history.
create table public.credits_balance (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  free_menus_used integer not null default 0,
  updated_at timestamptz not null default now()
);

create trigger set_credits_balance_updated_at
  before update on public.credits_balance
  for each row
  execute function public.set_updated_at();

alter table public.credits_balance enable row level security;

create policy "credits_balance_select_own_or_admin"
  on public.credits_balance for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- No insert/update/delete policy for authenticated on purpose: balances are
-- only ever mutated by trusted backend code (service_role, which bypasses
-- RLS entirely) once real credit logic lands in a later stage. Letting a
-- user write their own balance would let them grant themselves credits.
grant select on public.credits_balance to authenticated;
grant all on public.credits_balance to service_role;

-- credits_transactions: append-only audit log of every credit
-- grant/spend. `related_menu_id` will reference menus(id), but the menus
-- table is created in a later migration (20260710120500) — the FK
-- constraint is added there via ALTER TABLE once menus exists. The column
-- and its index are created here so this table's shape matches the spec
-- order; only the constraint itself is deferred.
create table public.credits_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount integer not null,
  type public.credit_transaction_type not null,
  related_menu_id uuid,
  description text,
  created_at timestamptz not null default now()
);

create index credits_transactions_user_id_idx on public.credits_transactions (user_id);
create index credits_transactions_type_idx on public.credits_transactions (type);
create index credits_transactions_related_menu_id_idx on public.credits_transactions (related_menu_id);
create index credits_transactions_user_id_created_at_idx
  on public.credits_transactions (user_id, created_at desc);

alter table public.credits_transactions enable row level security;

create policy "credits_transactions_select_own_or_admin"
  on public.credits_transactions for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- No write policies for authenticated/anon: transactions are an audit
-- trail written exclusively by trusted backend code (service_role).
grant select on public.credits_transactions to authenticated;
grant all on public.credits_transactions to service_role;

-- credit_costs: reference table of how many credits each action costs, so
-- prices can change without a deploy. `action_type` is a free-form `text`
-- key (not the credit_transaction_type enum) precisely so new priced
-- actions can be added with an INSERT instead of a schema migration.
create table public.credit_costs (
  action_type text primary key,
  cost integer not null check (cost >= 0),
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create index credit_costs_is_active_idx on public.credit_costs (is_active);

create trigger set_credit_costs_updated_at
  before update on public.credit_costs
  for each row
  execute function public.set_updated_at();

alter table public.credit_costs enable row level security;

create policy "credit_costs_select_authenticated"
  on public.credit_costs for select
  to authenticated
  using (true);

create policy "credit_costs_write_admin_only"
  on public.credit_costs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- authenticated gets write grants at the Postgres level too: admins are
-- ordinary `authenticated` connections (Supabase has no separate Postgres
-- role per app-level admin), so the base grant must allow writes and the
-- "credit_costs_write_admin_only" policy above is the actual gate.
grant select, insert, update, delete on public.credit_costs to authenticated;
grant all on public.credit_costs to service_role;
