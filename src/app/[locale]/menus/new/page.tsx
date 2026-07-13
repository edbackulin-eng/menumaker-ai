import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { ImportForm } from "@/components/menu-generator/import-form";
import { WizardSteps } from "@/components/menu-generator/wizard-steps";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("menuGenerator.import");
  return { title: t("metaTitle") };
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewMenuPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("menuGenerator.import");

  // proxy.ts already redirects unauthenticated requests away from /menus
  // (optimistic check); this re-verifies authoritatively, same pattern as
  // /dashboard (Stage 4).
  const user = await getCurrentUser();
  if (!user) {
    return redirect({ href: "/login", locale });
  }

  return (
    <Container size="md" className="py-8">
      <PageHeader title={t("title")} description={t("subtitle")} />
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
