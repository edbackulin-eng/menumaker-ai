-- Stage 9 (Stripe payments) — PAUSED by Product Owner decision before real
-- testing (Stripe doesn't support Ukrainian payouts without a foreign
-- entity; PO hasn't registered one yet, and wants to validate demand first
-- via the free tier before committing to that). The application code that
-- calls this function lives only on the `stage-9-stripe-payments-paused`
-- branch, not on main — see docs/payments-integration.md. This migration
-- stays on main (and applied to the real project) because it was already
-- pushed before the pause decision arrived, and the function itself is
-- inert: no schema changes to existing tables, no triggers, unreachable
-- from any code path currently on main.
--
-- Atomic, idempotent completion of a Checkout Session. Called from two
-- places that must never double-credit a user — POST /api/webhooks/stripe
-- (the normal path) and the /dashboard/credits/upgrade success-url fallback
-- (in case the webhook is delayed or lost) — so the idempotency guarantee
-- has to live here, in the database, rather than in either caller
-- individually.
--
-- Idempotency has two independent layers:
--   1. If a payments row for this checkout session already exists and is
--      already 'completed', return early without touching the balance
--      (`for update` locks the row first, so two callers racing on the
--      exact same session serialize instead of both passing the check).
--   2. If no pre-existing row is found (the pending row created at checkout
--      time failed to insert, or this is the fallback path racing ahead of
--      it), fall back to inserting the completed row directly, guarded by
--      the `stripe_payment_id` unique constraint (Stage 2) via
--      `on conflict ... do nothing` — Stripe's payment_intent id is unique
--      per successful payment, so a duplicate delivery can never insert
--      twice.
create function public.complete_stripe_payment(
  p_stripe_checkout_session_id text,
  p_stripe_payment_id text,
  p_user_id uuid,
  p_amount integer,
  p_currency text,
  p_credits integer
)
returns table (already_processed boolean, new_balance int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment_id uuid;
  v_status public.payment_status;
  v_new_balance int;
begin
  select id, status into v_payment_id, v_status
  from public.payments
  where stripe_checkout_session_id = p_stripe_checkout_session_id
  for update;

  if v_payment_id is not null then
    if v_status = 'completed' then
      select balance into v_new_balance from public.credits_balance where user_id = p_user_id;
      return query select true, coalesce(v_new_balance, 0);
      return;
    end if;

    update public.payments
    set status = 'completed', stripe_payment_id = p_stripe_payment_id
    where id = v_payment_id;
  else
    insert into public.payments (
      user_id, stripe_payment_id, stripe_checkout_session_id,
      amount, currency, credits_purchased, status
    )
    values (
      p_user_id, p_stripe_payment_id, p_stripe_checkout_session_id,
      p_amount, p_currency, p_credits, 'completed'
    )
    on conflict (stripe_payment_id) do nothing
    returning id into v_payment_id;

    if v_payment_id is null then
      select balance into v_new_balance from public.credits_balance where user_id = p_user_id;
      return query select true, coalesce(v_new_balance, 0);
      return;
    end if;
  end if;

  update public.credits_balance
  set balance = balance + p_credits
  where user_id = p_user_id
  returning balance into v_new_balance;

  insert into public.credits_transactions (user_id, amount, type, description)
  values (p_user_id, p_credits, 'purchase', 'Покупка пакету кредитів через Stripe');

  return query select false, v_new_balance;
end;
$$;

revoke all on function public.complete_stripe_payment(text, text, uuid, integer, text, integer) from public;
grant execute on function public.complete_stripe_payment(text, text, uuid, integer, text, integer) to service_role;
