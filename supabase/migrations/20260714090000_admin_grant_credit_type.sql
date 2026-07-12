-- Stage 10 (Admin Panel): a manual credit grant by an admin (support/refund
-- gestures) is a distinct ledger category from the AI-usage/purchase/bonus
-- types seeded in Stage 2 — needs its own enum value so credits_transactions
-- rows can be told apart by `type` alone, same as every other category.
--
-- Split into its own migration file (not merged with the migration that
-- creates admin_grant_credits(), which uses this value): Postgres forbids
-- using a freshly `ALTER TYPE ... ADD VALUE`'d enum member inside the same
-- transaction that added it, and each migration file is its own transaction.
alter type public.credit_transaction_type add value 'admin_grant';
