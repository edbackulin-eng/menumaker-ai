import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminCreditsStats } from "@/services/admin/credits";
import { CREDIT_TRANSACTION_TYPE_LABEL } from "@/config/credit-transaction-labels";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/admin/metric-card";

export const metadata: Metadata = { title: "Кредити — Admin Panel" };

export default async function AdminCreditsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "admin") {
    redirect("/dashboard?error=forbidden");
  }

  const { totalGranted, totalSpent, breakdown } = await getAdminCreditsStats(createServiceClient());
  const spentBreakdown = breakdown.filter((row) => row.total_amount < 0);

  return (
    <Container size="lg" className="py-10">
      <PageHeader title="Кредити" description="Загальна статистика по всій системі кредитів." />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard
          label="Усього нараховано"
          value={totalGranted}
          icon={ArrowUpCircle}
          hint="безкоштовні + куплені + вручну адміном"
        />
        <MetricCard label="Усього витрачено на AI" value={totalSpent} icon={ArrowDownCircle} />
      </div>

      <div className="mt-8">
        <h2 className="text-h6 text-foreground">Розбивка витрат за типом дії</h2>
        <p className="text-body-sm text-foreground-secondary mt-1">
          Які AI-функції користувачі використовують найбільше.
        </p>
      </div>
      <div className="border-border mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full text-left">
          <thead className="bg-surface-secondary text-caption text-foreground-tertiary">
            <tr>
              <th className="px-4 py-2.5 font-medium">Дія</th>
              <th className="px-4 py-2.5 font-medium">Витрачено кредитів</th>
              <th className="px-4 py-2.5 font-medium">К-сть операцій</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {spentBreakdown.map((row) => (
              <tr key={row.type}>
                <td className="text-body-sm text-foreground px-4 py-3 font-medium">
                  {CREDIT_TRANSACTION_TYPE_LABEL[row.type]}
                </td>
                <td className="text-body-sm text-foreground px-4 py-3">
                  {Math.abs(row.total_amount)}
                </td>
                <td className="text-body-sm text-foreground-secondary px-4 py-3">
                  {row.transaction_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
