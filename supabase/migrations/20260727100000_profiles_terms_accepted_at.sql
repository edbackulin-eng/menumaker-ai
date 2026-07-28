-- Legal record of consent to /privacy and /terms (Stage 15.6 GDPR follow-up —
-- the Google OAuth flow previously reached Google's consent screen with no
-- gate at all, and even the email-registration checkbox was validated
-- client-side only and never persisted). Nullable: existing rows (every
-- account created before this migration) start unset on purpose — that gap
-- is real and must not be hidden by backfilling a fake timestamp.
alter table public.profiles
  add column terms_accepted_at timestamptz;

-- Same defense-in-depth reasoning as the original trigger (see
-- 20260710120200_profiles.sql): a user could otherwise stamp their own
-- consent record via an ordinary UPDATE on their own row. Only service_role
-- (this app's backend, immediately after real consent is collected) or an
-- admin may set it.
create or replace function public.protect_privileged_profile_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;

  if new.role is distinct from old.role
    or new.subscription_status is distinct from old.subscription_status
    or new.subscription_tier is distinct from old.subscription_tier
    or new.subscription_expires_at is distinct from old.subscription_expires_at
    or new.terms_accepted_at is distinct from old.terms_accepted_at
  then
    raise exception 'Insufficient privileges to modify protected profile fields';
  end if;

  return new;
end;
$$;
