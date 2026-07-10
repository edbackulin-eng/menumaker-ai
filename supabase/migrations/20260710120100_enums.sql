-- Enum types shared across tables. Kept separate from table migrations so
-- `ALTER TYPE ... ADD VALUE` changes later can live in their own migration
-- without touching table definitions.

create type public.user_role as enum ('user', 'admin');

-- Fixed set of ledger entry categories for credits_transactions (an audit
-- log). Pricing for each action lives in credit_costs (a plain `text` key,
-- see 20260710120300_credits.sql) so new chargeable actions can be priced
-- without a schema migration; this enum only needs to grow when a genuinely
-- new *category of ledger entry* (not just a new priced action) appears.
create type public.credit_transaction_type as enum (
  'purchase',
  'menu_generation',
  'menu_translation',
  'ai_description',
  'refund',
  'bonus',
  'free_tier'
);

create type public.menu_status as enum ('draft', 'processing', 'completed', 'failed');

create type public.menu_source_type as enum ('pdf', 'docx', 'xlsx', 'text', 'manual');

create type public.menu_export_type as enum ('pdf', 'png', 'web', 'qr');

create type public.payment_status as enum ('pending', 'completed', 'failed', 'refunded');
