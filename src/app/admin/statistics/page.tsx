import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CURATED_LOCALES } from "@/config/profile";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminStatistics } from "@/services/admin/statistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { ActivityChart } from "@/components/admin/activity-chart";
import { BreakdownBarList } from "@/components/admin/breakdown-bar-list";
import { DateRangeSelector } from "@/components/admin/date-range-selector";

export const metadata: Metadata = { title: "Статистика — Admin Panel" };

const VALID_RANGES = [7, 30, 90];
const LOCALE_LABEL = new Map<string, string>(
  CURATED_LOCALES.map((locale) => [locale.id, locale.label]),
);
const PROVIDER_LABEL: Record<string, string> = { email: "Email", google: "Google" };

interface PageProps {
  searchParams: Promise<{ days?: string }>;
}

export default async function AdminStatisticsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "admin") {
    redirect("/dashboard?error=forbidden");
  }

  const { days: daysParam } = await searchParams;
  const days = VALID_RANGES.includes(Number(daysParam)) ? Number(daysParam) : 30;

  const { activity, localeBreakdown, registrationSourceBreakdown } = await getAdminStatistics(
    createServiceClient(),
    days,
  );

  return (
    <Container size="lg" className="py-10">
      <PageHeader
        title="Статистика"
        description="Розширені графіки активності та розбивки аудиторії."
      />

      <div className="mt-6">
        <DateRangeSelector days={days} />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Активність за {days} днів</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityChart data={activity} />
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Джерело реєстрації</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownBarList
              rows={registrationSourceBreakdown.map((row) => ({
                label: PROVIDER_LABEL[row.provider] ?? row.provider,
                count: row.user_count,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Мова профілю</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownBarList
              rows={localeBreakdown.map((row) => ({
                label: LOCALE_LABEL.get(row.locale) ?? row.locale,
                count: row.user_count,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
