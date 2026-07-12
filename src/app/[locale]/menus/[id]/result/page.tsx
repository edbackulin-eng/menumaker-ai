import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { publicEnv } from "@/config/env";
import { redirect } from "@/i18n/navigation";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { ExportPanel } from "@/components/menu-export/export-panel";
import { WizardSteps } from "@/components/menu-generator/wizard-steps";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { menuContentSchema } from "@/services/ai/schemas/menu-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("menuGenerator.result");
  return { title: t("metaTitle") };
}

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function MenuResultPage({ params }: PageProps) {
  const { locale, id } = await params;
  const t = await getTranslations("menuGenerator.result");

  const user = await getCurrentUser();
  if (!user) {
    return redirect({ href: "/login", locale });
  }

  const supabase = await createClient();
  const { data: menu } = await supabase
    .from("menus")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!menu) {
    notFound();
  }

  if (menu.status !== "completed") {
    return redirect({ href: `/menus/${id}/template`, locale });
  }

  const parsedContent = menuContentSchema.safeParse(menu.content);
  const categoryCount = parsedContent.success ? parsedContent.data.categories.length : 0;
  const itemCount = parsedContent.success
    ? parsedContent.data.categories.reduce((sum, category) => sum + category.items.length, 0)
    : 0;

  return (
    <Container size="md" className="py-10">
      <PageHeader title={t("title")} description={menu.title} />
      <div className="mt-6 mb-8">
        <WizardSteps current="result" />
      </div>
      <p className="text-body text-foreground-secondary mb-6">
        {t("summary", { title: menu.title, categoryCount, itemCount })}
      </p>
      <ExportPanel
        menuId={menu.id}
        appUrl={publicEnv.NEXT_PUBLIC_APP_URL}
        initialIsPublic={menu.is_public}
        initialPublicSlug={menu.public_slug}
      />
    </Container>
  );
}
