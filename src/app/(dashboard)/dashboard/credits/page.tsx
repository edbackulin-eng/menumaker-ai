import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, CircleDashed } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { getDashboardSummary } from "@/services/dashboard/get-summary";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { TransactionList } from "@/components/dashboard/transaction-list";

export const metadata: Metadata = { title: "Кредити — MenuMaker AI" };

export default async function CreditsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const summary = await getDashboardSummary(supabase, user.id);
  const freeMenuAvailable = summary.freeMenusUsed < summary.freeMenuLimit;

  return (
    <Container size="lg" className="py-10">
      <PageHeader
        title="Кредити"
        description="Баланс і статус безкоштовної спроби."
        actions={
          <Link href="/dashboard/credits/upgrade" className={buttonVariants()}>
            Поповнити
          </Link>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Баланс</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-h1 text-foreground">{summary.balance}</p>
            <p className="text-body-sm text-foreground-secondary mt-1">кредитів</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Безкоштовна спроба</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {freeMenuAvailable ? (
              <>
                <CircleDashed className="text-accent-600 size-6" aria-hidden="true" />
                <p className="text-body text-foreground">Доступна</p>
              </>
            ) : (
              <>
                <CheckCircle2 className="text-foreground-tertiary size-6" aria-hidden="true" />
                <p className="text-body text-foreground-secondary">Використано</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-h6 text-foreground">Останні транзакції</h2>
        <Link
          href="/dashboard/history"
          className="text-body-sm text-accent-600 font-medium underline underline-offset-2"
        >
          Уся історія
        </Link>
      </div>
      <div className="mt-3">
        <TransactionList transactions={summary.recentTransactions} />
      </div>
    </Container>
  );
}
