import Link from "next/link";

import type { DashboardTransaction } from "@/services/dashboard/get-summary";
import { EmptyState } from "@/components/shared/empty-state";
import type { Database } from "@/types/database.types";

const TYPE_LABEL: Record<Database["public"]["Enums"]["credit_transaction_type"], string> = {
  purchase: "Покупка кредитів",
  menu_generation: "Аналіз меню",
  menu_translation: "Переклад меню",
  ai_description: "AI-опис страви",
  refund: "Повернення",
  bonus: "Бонус",
  free_tier: "Безкоштовна спроба",
};

const dateTimeFormatter = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export interface TransactionListProps {
  transactions: DashboardTransaction[];
  emptyDescription?: string;
}

/** Shared between /dashboard/credits (a recent slice) and /dashboard/history (the full paginated list) — see docs/dashboard.md for why one component covers both. */
export function TransactionList({ transactions, emptyDescription }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="Історія порожня"
        description={
          emptyDescription ?? "Дії з кредитами з'являться тут після першого створення меню."
        }
      />
    );
  }

  return (
    <ul className="border-border divide-border divide-y rounded-lg border">
      {transactions.map((transaction) => (
        <li key={transaction.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="text-body-sm text-foreground font-medium">
              {TYPE_LABEL[transaction.type]}
            </p>
            <p className="text-caption text-foreground-tertiary">
              {dateTimeFormatter.format(new Date(transaction.created_at))}
              {transaction.related_menu_id && transaction.related_menu_title && (
                <>
                  {" · "}
                  <Link
                    href={`/menus/${transaction.related_menu_id}/editor`}
                    className="hover:text-foreground-secondary underline underline-offset-2"
                  >
                    {transaction.related_menu_title}
                  </Link>
                </>
              )}
              {transaction.description &&
                !transaction.related_menu_title &&
                ` · ${transaction.description}`}
            </p>
          </div>
          <span
            className={
              transaction.amount > 0
                ? "text-success-600 text-body-sm shrink-0 font-semibold"
                : transaction.amount < 0
                  ? "text-error-600 text-body-sm shrink-0 font-semibold"
                  : "text-foreground-tertiary text-body-sm shrink-0 font-semibold"
            }
          >
            {transaction.amount > 0 ? "+" : ""}
            {transaction.amount}
          </span>
        </li>
      ))}
    </ul>
  );
}
