import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { publicEnv } from "@/config/env";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { ExportPanel } from "@/components/menu-export/export-panel";
import { WizardSteps } from "@/components/menu-generator/wizard-steps";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { menuContentSchema } from "@/services/ai/schemas/menu-content";

export const metadata: Metadata = { title: "Меню готове — MenuMaker AI" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MenuResultPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
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
    redirect(`/menus/${id}/template`);
  }

  const parsedContent = menuContentSchema.safeParse(menu.content);
  const categoryCount = parsedContent.success ? parsedContent.data.categories.length : 0;
  const itemCount = parsedContent.success
    ? parsedContent.data.categories.reduce((sum, category) => sum + category.items.length, 0)
    : 0;

  return (
    <Container size="md" className="py-10">
      <PageHeader title="Меню готове!" description={menu.title} />
      <div className="mt-6 mb-8">
        <WizardSteps current="result" />
      </div>
      <p className="text-body text-foreground-secondary mb-6">
        Меню «{menu.title}» успішно створено: {categoryCount} категорій, {itemCount} страв.
        Опублікуйте його як Web Menu або завантажте готові файли нижче.
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
