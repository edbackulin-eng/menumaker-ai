import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Info } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Платежі — Admin Panel" };

const dateTimeFormatter = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Очікує",
  completed: "Оплачено",
  failed: "Не вдалося",
  refunded: "Повернено",
};

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  pending: "warning",
  completed: "success",
  failed: "error",
  refunded: "neutral",
};

const RECENT_PAYMENTS_LIMIT = 20;

export default async function AdminPaymentsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "admin") {
    redirect("/dashboard?error=forbidden");
  }

  const supabase = await createClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("id, user_id, amount, currency, credits_purchased, status, created_at")
    .order("created_at", { ascending: false })
    .limit(RECENT_PAYMENTS_LIMIT);

  const rows = payments ?? [];
  const ownerEmails = new Map<string, string>();
  if (rows.length > 0) {
    const userIds = [...new Set(rows.map((row) => row.user_id))];
    const { data: owners } = await supabase.from("profiles").select("id, email").in("id", userIds);
    for (const owner of owners ?? []) {
      ownerEmails.set(owner.id, owner.email);
    }
  }

  return (
    <Container size="lg" className="py-10">
      <PageHeader title="Платежі" description="Структура готова до активації платіжної системи." />

      <div className="border-accent-400/40 bg-accent-50 mt-6 flex items-start gap-3 rounded-lg border p-4">
        <Info className="text-accent-600 mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p className="text-body-sm text-foreground-secondary">
          Платіжна система тимчасово не активна — рішення Product Owner (юридичні обмеження Stripe
          для України, перевірка попиту перед підключенням оплати). Таблиця нижче вже готова до
          реальних даних Stripe-платежів без додаткової розробки UI. Деталі рішення —{" "}
          <code className="bg-accent-100 rounded px-1 py-0.5 text-xs">
            docs/payments-integration.md
          </code>{" "}
          у репозиторії проєкту.
        </p>
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState
            title="Ще немає платежів"
            description="Записи з'являться тут автоматично, коли оплату буде активовано."
          />
        ) : (
          <div className="border-border overflow-x-auto rounded-lg border">
            <table className="w-full text-left">
              <thead className="bg-surface-secondary text-caption text-foreground-tertiary">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Користувач</th>
                  <th className="px-4 py-2.5 font-medium">Сума</th>
                  <th className="px-4 py-2.5 font-medium">Кредитів</th>
                  <th className="px-4 py-2.5 font-medium">Статус</th>
                  <th className="px-4 py-2.5 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="text-body-sm text-foreground px-4 py-3">
                      {ownerEmails.get(row.user_id) ?? row.user_id}
                    </td>
                    <td className="text-body-sm text-foreground px-4 py-3">
                      {(row.amount / 100).toFixed(2)} {row.currency.toUpperCase()}
                    </td>
                    <td className="text-body-sm text-foreground px-4 py-3">
                      {row.credits_purchased}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge>
                    </td>
                    <td className="text-body-sm text-foreground-secondary px-4 py-3">
                      {dateTimeFormatter.format(new Date(row.created_at))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Container>
  );
}
