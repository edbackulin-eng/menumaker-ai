import type { Database } from "@/types/database.types";

/**
 * Ukrainian-only labels for the admin panel (Admin Credits page) — admin
 * stays Ukrainian regardless of interface locale and has no next-intl
 * context available to it (Stage 12). The localized dashboard equivalent
 * lives in `dashboard.transactions.types` (messages/*.json), consumed
 * directly by `TransactionList` via `useTranslations`.
 */
export const CREDIT_TRANSACTION_TYPE_LABEL: Record<
  Database["public"]["Enums"]["credit_transaction_type"],
  string
> = {
  purchase: "Покупка кредитів",
  menu_generation: "Аналіз меню",
  menu_translation: "Переклад меню",
  ai_description: "AI-опис страви",
  refund: "Повернення",
  bonus: "Бонус",
  free_tier: "Безкоштовна спроба",
  admin_grant: "Нараховано адміністратором",
};
