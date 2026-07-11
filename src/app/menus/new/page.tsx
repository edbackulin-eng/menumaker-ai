import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { ImportForm } from "@/components/menu-generator/import-form";
import { WizardSteps } from "@/components/menu-generator/wizard-steps";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export const metadata: Metadata = { title: "Нове меню — MenuMaker AI" };

export default async function NewMenuPage() {
  // proxy.ts already redirects unauthenticated requests away from /menus
  // (optimistic check); this re-verifies authoritatively, same pattern as
  // /dashboard (Stage 4).
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <Container size="md" className="py-10">
      <PageHeader
        title="Створити меню"
        description="Завантажте файл меню або вставте текст — AI розпізнає категорії, страви й ціни."
      />
      <div className="mt-6 mb-8">
        <WizardSteps current="import" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <ImportForm />
        </CardContent>
      </Card>
    </Container>
  );
}
