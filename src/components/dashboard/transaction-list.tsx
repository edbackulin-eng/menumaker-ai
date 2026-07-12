import { useFormatter, useTranslations } from "next-intl";

import type { DashboardTransaction } from "@/services/dashboard/get-summary";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/shared/empty-state";

export interface TransactionListProps {
  transactions: DashboardTransaction[];
  emptyDescription?: string;
}

/** Shared between /dashboard/credits (a recent slice) and /dashboard/history (the full paginated list) — see docs/dashboard.md for why one component covers both. */
export function TransactionList({ transactions, emptyDescription }: TransactionListProps) {
  const t = useTranslations("dashboard.transactions");
  const format = useFormatter();

  if (transactions.length === 0) {
    return (
      <EmptyState title={t("emptyTitle")} description={emptyDescription ?? t("emptyDescription")} />
    );
  }

  return (
    <ul className="border-border divide-border divide-y rounded-lg border">
      {transactions.map((transaction) => (
        <li key={transaction.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="text-body-sm text-foreground font-medium">
              {t(`types.${transaction.type}`)}
            </p>
            <p className="text-caption text-foreground-tertiary">
              {format.dateTime(new Date(transaction.created_at), {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
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
