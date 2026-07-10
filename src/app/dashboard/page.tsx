import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export const metadata: Metadata = { title: "Кабінет — MenuMaker AI" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // proxy.ts already redirects unauthenticated requests away from
  // /dashboard, but that's documented by Next as an *optimistic* check
  // (see src/proxy.ts) — the page re-verifies authoritatively.
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await searchParams;

  return (
    <Container size="lg" className="py-10">
      <PageHeader
        title="Кабінет"
        description="Мінімальна заглушка — повний Dashboard будується на Етапі 8."
        actions={<LogoutButton variant="secondary" />}
      />
      {error === "forbidden" && (
        <div className="border-warning-400/30 bg-warning-50 text-body-sm text-warning-600 mt-6 rounded-md border px-4 py-3">
          У вас немає доступу до адмін-панелі.
        </div>
      )}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{user.full_name ?? user.email}</CardTitle>
          <CardDescription>
            {user.email} · роль: {user.role} · локаль: {user.locale}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body-sm text-foreground-secondary">
            Ви успішно автентифіковані. Функціонал кабінету з&apos;явиться на наступних етапах.
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
