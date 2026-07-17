import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { MENU_EDITOR_FONT_VARIABLES_CLASSNAME } from "@/lib/fonts/menu-fonts";
import { publicEnv } from "@/config/env";
import { redirect } from "@/i18n/navigation";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { ExportPanel } from "@/components/menu-export/export-panel";
import { WizardExitButton, WizardExitProvider } from "@/components/menu-generator/wizard-exit";
import { WizardSteps } from "@/components/menu-generator/wizard-steps";
import { MenuStaticView } from "@/components/menu-render/menu-static-view";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { applyStyleOrder } from "@/lib/utils/menu-content-order";
import { resolveEffectiveStyle, resolveTemplateDefaults } from "@/lib/utils/resolve-menu-style";
import { styleOverridesSchema } from "@/lib/validations/menu-style";
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

  const { data: template } = menu.template_id
    ? await supabase
        .from("menu_templates")
        .select("config")
        .eq("id", menu.template_id)
        .maybeSingle()
    : { data: null };

  const parsedContent = menuContentSchema.safeParse(menu.content);
  const content = parsedContent.success ? parsedContent.data : { categories: [] };
  const categoryCount = content.categories.length;
  const itemCount = content.categories.reduce((sum, category) => sum + category.items.length, 0);

  const parsedStyleOverrides = styleOverridesSchema.safeParse(menu.style_overrides ?? {});
  const styleOverrides = parsedStyleOverrides.success ? parsedStyleOverrides.data : {};
  const templateDefaults = resolveTemplateDefaults(
    template?.config as Record<string, unknown> | null,
  );
  const effectiveStyle = resolveEffectiveStyle(templateDefaults, styleOverrides);
  const orderedContent = applyStyleOrder(content, styleOverrides);

  return (
    <Container size="md" className="py-8">
      <WizardExitProvider>
        <WizardExitButton />
        <PageHeader title={t("title")} description={menu.title} />
        <div className="mt-6 mb-8">
          <WizardSteps current="result" />
        </div>
        <p className="text-body text-foreground-secondary mb-6">
          {t("summary", { title: menu.title, categoryCount, itemCount })}
        </p>
        <div className={`mb-8 ${MENU_EDITOR_FONT_VARIABLES_CLASSNAME}`}>
          <MenuStaticView content={orderedContent} style={effectiveStyle} />
        </div>
        <ExportPanel
          menuId={menu.id}
          appUrl={publicEnv.NEXT_PUBLIC_APP_URL}
          initialIsPublic={menu.is_public}
          initialPublicSlug={menu.public_slug}
        />
      </WizardExitProvider>
    </Container>
  );
}
