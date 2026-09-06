import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckCircle2, CircleDashed, Coins, Gift } from "lucide-react";

import { isDemoMode } from "@/config/demo";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { DEMO_SUMMARY, getDashboardSummary } from "@/services/dashboard/get-summary";
import { Link, redirect } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { TransactionList } from "@/components/dashboard/transaction-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.credits");
  return { title: t("metaTitle") };
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function CreditsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.credits");

  const user = await getCurrentUser();
  if (!user) {
    return redirect({ href: "/login", locale });
  }

  // Demo: canned summary, no Supabase client constructed.
  const summary = isDemoMode
    ? DEMO_SUMMARY
    : await getDashboardSummary(await createClient(), user.id);
  const freeMenuAvailable = summary.freeMenusUsed < summary.freeMenuLimit;

  return (
    <Container size="lg" className="py-8">
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Link href="/dashboard/credits/upgrade" className={buttonVariants()}>
            {t("topUp")}
          </Link>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="text-accent-600 size-4" aria-hidden="true" />
              {t("balanceTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-h1 text-foreground">{summary.balance}</p>
            <p className="text-body-sm text-foreground-secondary mt-1">{t("balanceUnit")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="text-accent-600 size-4" aria-hidden="true" />
              {t("freeTrialTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {freeMenuAvailable ? (
              <>
                <CircleDashed className="text-accent-600 size-6" aria-hidden="true" />
                <p className="text-body text-foreground">{t("available")}</p>
              </>
            ) : (
              <>
                <CheckCircle2 className="text-foreground-tertiary size-6" aria-hidden="true" />
                <p className="text-body text-foreground-secondary">{t("used")}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-h6 text-foreground">{t("recentTransactions")}</h2>
        <Link
          href="/dashboard/history"
          className="text-body-sm text-accent-600 font-medium underline underline-offset-2"
        >
          {t("viewAllHistory")}
        </Link>
      </div>
      <div className="mt-3">
        <TransactionList transactions={summary.recentTransactions} />
      </div>
    </Container>
  );
}
