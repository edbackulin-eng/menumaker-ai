import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export const metadata: Metadata = { title: "Адмін-панель — MenuMaker AI" };

export default async function AdminPage() {
  // Authoritative check — proxy.ts's role check is an *optimistic* fast
  // redirect (see src/proxy.ts comment), this is the real gate.
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "admin") {
    redirect("/dashboard?error=forbidden");
  }

  return (
    <Container size="lg" className="py-10">
      <PageHeader
        title="Адмін-панель"
        description="Мінімальна заглушка — повний UI адмінки будується на Етапі 10."
        actions={<LogoutButton variant="secondary" />}
      />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Доступ підтверджено</CardTitle>
          <CardDescription>
            {user.email} · роль: {user.role}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body-sm text-foreground-secondary">
            Цю сторінку бачать лише користувачі з роллю admin.
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
