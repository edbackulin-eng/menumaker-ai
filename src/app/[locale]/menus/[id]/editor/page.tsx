import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { defaultCurrencyForLocale, isCurrencyId } from "@/config/menu-currency";
import { MENU_EDITOR_FONT_VARIABLES_CLASSNAME } from "@/lib/fonts/menu-fonts";
import { createClient } from "@/lib/supabase/server";
import { resolveTemplateDefaults } from "@/lib/utils/resolve-menu-style";
import { styleOverridesSchema } from "@/lib/validations/menu-style";
import { menuContentSchema } from "@/services/ai/schemas/menu-content";
import { redirect } from "@/i18n/navigation";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { MenuStyleEditor } from "@/components/menu-editor/menu-style-editor";
import { WizardExitButton, WizardExitProvider } from "@/components/menu-generator/wizard-exit";
import { WizardSteps } from "@/components/menu-generator/wizard-steps";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("menuGenerator.editor");
  return { title: t("metaTitle") };
}

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function MenuEditorPage({ params }: PageProps) {
  const { locale, id } = await params;
  const t = await getTranslations("menuGenerator.editor");

  const user = await getCurrentUser();
  if (!user) {
    return redirect({ href: "/login", locale });
  }

  const supabase = await createClient();
  const { data: menu } = await supabase
    .from("menus")
    .select("id, title, content, style_overrides, status, content_confirmed_at, template_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!menu) {
    notFound();
  }

  if (!menu.content_confirmed_at) {
    return redirect({ href: `/menus/${id}/review`, locale });
  }
  if (!menu.template_id) {
    return redirect({ href: `/menus/${id}/template`, locale });
  }

  const { data: template } = await supabase
    .from("menu_templates")
    .select("config, engine, palette")
    .eq("id", menu.template_id)
    .maybeSingle();

  const templateDefaults = resolveTemplateDefaults({
    config: template?.config as Record<string, unknown> | null,
    engine: template?.engine,
    palette: template?.palette as Record<string, unknown> | null,
  });

  const parsedContent = menuContentSchema.safeParse(menu.content);
  const content = parsedContent.success ? parsedContent.data : { categories: [] };

  const parsedStyleOverrides = styleOverridesSchema.safeParse(menu.style_overrides ?? {});
  const initialStyleOverrides = parsedStyleOverrides.success ? parsedStyleOverrides.data : {};

  const initialCurrencyId =
    content.currency && isCurrencyId(content.currency)
      ? content.currency
      : defaultCurrencyForLocale(locale);

  return (
    <Container size="xl" className={`py-8 ${MENU_EDITOR_FONT_VARIABLES_CLASSNAME}`}>
      <WizardExitProvider>
        <WizardExitButton />
        <PageHeader title={menu.title} description={t("subtitle")} />
        <div className="mt-6 mb-8">
          <WizardSteps current="editor" />
        </div>
        <MenuStyleEditor
          menuId={menu.id}
          content={content}
          initialStyleOverrides={initialStyleOverrides}
          templateDefaults={templateDefaults}
          initialCurrencyId={initialCurrencyId}
        />
      </WizardExitProvider>
    </Container>
  );
}
