-- Atomic gate for the Menu Generator's paid step (the analyzeMenu() call in
-- POST /api/menus/import, see src/services/menu-generator/menu-creation-credit.ts):
-- the user's first `p_free_limit` menus are free (increments
-- credits_balance.free_menus_used, logs a zero-amount 'free_tier' ledger
-- row for audit purposes), every menu after that spends p_cost paid credits
-- exactly like spend_credits() (Stage 6, 20260711140000_ai_credit_functions.sql).
--
-- `for update` locks the user's credits_balance row for the duration of the
-- function so two concurrent imports can't both read free_menus_used before
-- either commits and both get a free menu — the second caller's SELECT
-- blocks until the first's UPDATE commits, then sees the incremented value.
create function public.consume_menu_creation_credit(
  p_user_id uuid,
  p_free_limit int,
  p_cost int,
  p_related_menu_id uuid,
  p_description text
)
returns table (used_free boolean, success boolean, new_balance int, new_free_menus_used int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_free_menus_used int;
  v_balance int;
begin
  select free_menus_used, balance into v_free_menus_used, v_balance
  from public.credits_balance
  where user_id = p_user_id
  for update;

  if not found then
    return query select false, false, 0, 0;
    return;
  end if;

  if v_free_menus_used < p_free_limit then
    update public.credits_balance
    set free_menus_used = free_menus_used + 1
    where user_id = p_user_id
    returning free_menus_used into v_free_menus_used;

    insert into public.credits_transactions (user_id, amount, type, related_menu_id, description)
    values (p_user_id, 0, 'free_tier', p_related_menu_id, p_description);

    return query select true, true, v_balance, v_free_menus_used;
    return;
  end if;

  update public.credits_balance
  set balance = balance - p_cost
  where user_id = p_user_id and balance >= p_cost
  returning balance into v_balance;

  if not found then
    return query
      select
        false,
        false,
        coalesce((select balance from public.credits_balance where user_id = p_user_id), 0),
        v_free_menus_used;
    return;
  end if;

  insert into public.credits_transactions (user_id, amount, type, related_menu_id, description)
  values (p_user_id, -p_cost, 'menu_generation', p_related_menu_id, p_description);

  return query select false, true, v_balance, v_free_menus_used;
end;
$$;

revoke all on function public.consume_menu_creation_credit(uuid, int, int, uuid, text) from public;
grant execute on function public.consume_menu_creation_credit(uuid, int, int, uuid, text) to service_role;
