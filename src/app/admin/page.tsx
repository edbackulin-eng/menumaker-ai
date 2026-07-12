import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarDays, FileText, Percent, Sparkles, UserPlus, Users } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createServiceClient } from "@/lib/supabase/service";
import { getAdminDashboardData } from "@/services/admin/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { ActivityChart } from "@/components/admin/activity-chart";
import { MetricCard } from "@/components/admin/metric-card";
import { RecentRegistrationsList } from "@/components/admin/recent-registrations-list";

export const metadata: Metadata = { title: "Дашборд — Admin Panel" };

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "admin") {
    redirect("/dashboard?error=forbidden");
  }

  const { stats, activity, recentUsers } = await getAdminDashboardData(createServiceClient());

  return (
    <Container size="lg" className="py-10">
      <PageHeader
        title="Дашборд"
        description="Огляд реальної активності користувачів — реєстрації, безкоштовні спроби, конверсія."
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Усього користувачів" value={stats.total_users} icon={Users} />
        <MetricCard label="Нові сьогодні" value={stats.new_users_today} icon={UserPlus} />
        <MetricCard label="Нові за тиждень" value={stats.new_users_week} icon={CalendarDays} />
        <MetricCard label="Нові за місяць" value={stats.new_users_month} icon={CalendarDays} />
        <MetricCard label="Усього створено меню" value={stats.total_menus} icon={FileText} />
        <MetricCard
          label="Використано безкоштовних спроб"
          value={stats.free_trials_used}
          icon={Sparkles}
          hint={`з ${stats.total_users} користувачів`}
        />
        <MetricCard
          label="Конверсія у створення меню"
          value={`${stats.conversion_pct}%`}
          icon={Percent}
          hint="користувачів створили хоча б одне меню"
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Активність за останні 30 днів</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityChart data={activity} />
        </CardContent>
      </Card>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-h6 text-foreground">Останні реєстрації</h2>
      </div>
      <div className="mt-3">
        <RecentRegistrationsList users={recentUsers} />
      </div>
    </Container>
  );
}
