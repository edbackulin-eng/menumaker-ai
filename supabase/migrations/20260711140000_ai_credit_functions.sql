-- Stage 6 (AI Service Layer): two new priced actions that didn't exist when
-- credit_costs was first seeded (20260710120300) — structureMenu and
-- fixText don't map cleanly onto the four categories seeded back then
-- (menu_generation/menu_translation/ai_description/ai_improvement).
-- INSERT, not a schema change, per credit_costs' own design (see comment on
-- that table): pricing changes without a deploy.
insert into public.credit_costs (action_type, cost, is_active)
values
  ('menu_structuring', 1, true),
  ('text_fix', 1, true)
on conflict (action_type) do nothing;

-- Atomic credit deduction + ledger insert for AI calls
-- (src/services/ai/credit-guard.ts). Both statements run in the same
-- implicit transaction, so a spend can never partially apply. The
-- `where balance >= p_amount` guard makes the UPDATE itself race-safe: two
-- concurrent calls for the same user can't both succeed past a balance that
-- only covers one of them.
--
-- `amount` is stored negative in credits_transactions (a spend), matching
-- the ledger's signed-amount convention — positive rows are reserved for
-- purchase/refund/bonus/free_tier grants (Stage 9).
create function public.spend_credits(
  p_user_id uuid,
  p_amount int,
  p_type public.credit_transaction_type,
  p_description text,
  p_related_menu_id uuid default null
)
returns table (success boolean, new_balance int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance int;
begin
  update public.credits_balance
  set balance = balance - p_amount
  where user_id = p_user_id and balance >= p_amount
  returning balance into v_new_balance;

  if not found then
    return query
      select false, coalesce((select balance from public.credits_balance where user_id = p_user_id), 0);
    return;
  end if;

  insert into public.credits_transactions (user_id, amount, type, related_menu_id, description)
  values (p_user_id, -p_amount, p_type, p_related_menu_id, p_description);

  return query select true, v_new_balance;
end;
$$;

revoke all on function public.spend_credits(uuid, int, public.credit_transaction_type, text, uuid) from public;
grant execute on function public.spend_credits(uuid, int, public.credit_transaction_type, text, uuid) to service_role;
