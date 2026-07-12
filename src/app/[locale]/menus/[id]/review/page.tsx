import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { MenuReviewEditor } from "@/components/menu-generator/menu-review-editor";
import { WizardSteps } from "@/components/menu-generator/wizard-steps";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { menuContentSchema } from "@/services/ai/schemas/menu-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("menuGenerator.review");
  return { title: t("metaTitle") };
}

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function MenuReviewPage({ params }: PageProps) {
  const { locale, id } = await params;
  const t = await getTranslations("menuGenerator.review");

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

  if (menu.status === "processing") {
    // The import request is still running (or crashed mid-flight) —
    // nothing to review yet.
    return redirect({ href: "/menus/new", locale });
  }

  // Already confirmed on a previous visit — Review is edit-before-confirm,
  // so a confirmed menu belongs on the next step.
  if (menu.content_confirmed_at) {
    return redirect({ href: `/menus/${id}/template`, locale });
  }

  const parsedContent = menuContentSchema.safeParse(menu.content);
  const initialContent = parsedContent.success ? parsedContent.data : { categories: [] };

  return (
    <Container size="lg" className="py-10">
      <PageHeader title={menu.title} description={t("subtitle")} />
      <div className="mt-6 mb-8">
        <WizardSteps current="review" />
      </div>
      <MenuReviewEditor menuId={menu.id} initialContent={initialContent} />
    </Container>
  );
}
