import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { TemplateGallery } from "@/components/menu-generator/template-gallery";
import { WizardExitButton } from "@/components/menu-generator/wizard-exit";
import { WizardSteps } from "@/components/menu-generator/wizard-steps";
import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { resolveTemplateDefaults } from "@/lib/utils/resolve-menu-style";
import { menuContentSchema } from "@/services/ai/schemas/menu-content";
import type { Json } from "@/types/database.types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("menuGenerator.template");
  return { title: t("metaTitle") };
}

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

// Looks up a template's own display name in the *menu's content locale*
// (Stage 6 AI-generated content language) — deliberately independent of
// the interface locale system added in Stage 12 (see Task 7 in the Stage
// 12 report: content language and interface language are different axes).
function localizedTemplateName(name: Json, contentLocale: string, fallback: string): string {
  if (name && typeof name === "object" && !Array.isArray(name)) {
    const record = name as Record<string, Json>;
    const short = contentLocale.slice(0, 2);
    const value = record[contentLocale] ?? record[short] ?? record.en;
    if (typeof value === "string") return value;
  }
  return fallback;
}

export default async function MenuTemplatePage({ params }: PageProps) {
  const { locale, id } = await params;
  const t = await getTranslations("menuGenerator.template");

  const user = await getCurrentUser();
  if (!user) {
    return redirect({ href: "/login", locale });
  }

  const supabase = await createClient();
  const { data: menu } = await supabase
    .from("menus")
    .select("id, title, locale, content, content_confirmed_at, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!menu) {
    notFound();
  }

  if (menu.status === "completed") {
    return redirect({ href: `/menus/${id}/result`, locale });
  }
  if (!menu.content_confirmed_at) {
    return redirect({ href: `/menus/${id}/review`, locale });
  }

  const { data: templates } = await supabase
    .from("menu_templates")
    .select("id, slug, name, category, config")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const parsedContent = menuContentSchema.safeParse(menu.content);
  const content = parsedContent.success ? parsedContent.data : { categories: [] };

  const defaultName = t("defaultName");
  const cards = (templates ?? []).map((template) => ({
    id: template.id,
    slug: template.slug,
    category: template.category,
    name: localizedTemplateName(template.name, menu.locale, defaultName),
    style: resolveTemplateDefaults(template.config as Record<string, unknown> | null),
  }));

  return (
    <Container size="lg" className="py-8">
      <WizardExitButton />
      <PageHeader title={menu.title} description={t("subtitle")} />
      <div className="mt-6 mb-8">
        <WizardSteps current="template" />
      </div>
      <TemplateGallery menuId={menu.id} templates={cards} content={content} />
    </Container>
  );
}
