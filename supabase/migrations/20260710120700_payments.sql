-- payments: history of Stripe payments. Stripe SDK integration lands in a
-- later stage; this table is laid down now so the schema is stable.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  stripe_payment_id text unique,
  stripe_checkout_session_id text,
  amount integer not null,
  currency text not null default 'usd',
  credits_purchased integer not null,
  status public.payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_user_id_idx on public.payments (user_id);
create index payments_status_idx on public.payments (status);
create index payments_stripe_checkout_session_id_idx on public.payments (stripe_checkout_session_id);

create trigger set_payments_updated_at
  before update on public.payments
  for each row
  execute function public.set_updated_at();

alter table public.payments enable row level security;

create policy "payments_select_own_or_admin"
  on public.payments for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- No write policies for authenticated/anon: payment records are created and
-- transitioned exclusively by the Stripe webhook handler running as
-- service_role (Stage 9). A user must never be able to mark their own
-- payment "completed" or grant themselves credits_purchased.
grant select on public.payments to authenticated;
grant all on public.payments to service_role;
