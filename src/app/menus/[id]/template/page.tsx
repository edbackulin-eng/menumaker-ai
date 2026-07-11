import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { TemplateGallery } from "@/components/menu-generator/template-gallery";
import { WizardSteps } from "@/components/menu-generator/wizard-steps";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";

export const metadata: Metadata = { title: "Оберіть шаблон — MenuMaker AI" };

interface PageProps {
  params: Promise<{ id: string }>;
}

function localizedTemplateName(name: Json, locale: string): string {
  if (name && typeof name === "object" && !Array.isArray(name)) {
    const record = name as Record<string, Json>;
    const short = locale.slice(0, 2);
    const value = record[locale] ?? record[short] ?? record.en;
    if (typeof value === "string") return value;
  }
  return "Шаблон";
}

export default async function MenuTemplatePage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data: menu } = await supabase
    .from("menus")
    .select("id, title, locale, content_confirmed_at, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!menu) {
    notFound();
  }

  if (menu.status === "completed") {
    redirect(`/menus/${id}/result`);
  }
  if (!menu.content_confirmed_at) {
    redirect(`/menus/${id}/review`);
  }

  const { data: templates } = await supabase
    .from("menu_templates")
    .select("id, slug, name, category")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const cards = (templates ?? []).map((template) => ({
    id: template.id,
    slug: template.slug,
    category: template.category,
    name: localizedTemplateName(template.name, menu.locale),
  }));

  return (
    <Container size="lg" className="py-10">
      <PageHeader title={menu.title} description="Оберіть шаблон дизайну для вашого меню." />
      <div className="mt-6 mb-8">
        <WizardSteps current="template" />
      </div>
      <TemplateGallery menuId={menu.id} templates={cards} />
    </Container>
  );
}
