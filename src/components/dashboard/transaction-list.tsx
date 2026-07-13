import { useFormatter, useTranslations } from "next-intl";
import {
  Gift,
  Languages,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Wallet,
  Wand2,
  type LucideIcon,
} from "lucide-react";

import type { Database } from "@/types/database.types";
import type { DashboardTransaction } from "@/services/dashboard/get-summary";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/shared/empty-state";

export interface TransactionListProps {
  transactions: DashboardTransaction[];
  emptyDescription?: string;
}

// One icon per transaction type — a quick-scan visual identity for each
// row instead of relying on the type label text alone (PO feedback: the
// dashboard reads as text-heavy/low-density; this list already had
// semantic amount coloring, but nothing to differentiate rows at a glance
// before reading them).
const TRANSACTION_TYPE_ICONS: Record<
  Database["public"]["Enums"]["credit_transaction_type"],
  LucideIcon
> = {
  purchase: Wallet,
  menu_generation: Sparkles,
  menu_translation: Languages,
  ai_description: Wand2,
  refund: RotateCcw,
  bonus: Gift,
  free_tier: Gift,
  admin_grant: ShieldCheck,
};

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
      {transactions.map((transaction) => {
        const Icon = TRANSACTION_TYPE_ICONS[transaction.type];
        const tone =
          transaction.amount > 0 ? "success" : transaction.amount < 0 ? "error" : "neutral";
        const badgeClassName =
          tone === "success"
            ? "bg-success-50 text-success-600"
            : tone === "error"
              ? "bg-error-50 text-error-600"
              : "bg-surface-secondary text-foreground-tertiary";
        const amountClassName =
          tone === "success"
            ? "text-success-600"
            : tone === "error"
              ? "text-error-600"
              : "text-foreground-tertiary";

        return (
          <li key={transaction.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${badgeClassName}`}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
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
            </div>
            <span className={`text-body-sm shrink-0 font-semibold ${amountClassName}`}>
              {transaction.amount > 0 ? "+" : ""}
              {transaction.amount}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
