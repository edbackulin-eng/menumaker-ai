import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { MENU_EDITOR_FONT_VARIABLES_CLASSNAME } from "@/lib/fonts/menu-fonts";
import { createClient } from "@/lib/supabase/server";
import { resolveTemplateDefaults } from "@/lib/utils/resolve-menu-style";
import { styleOverridesSchema } from "@/lib/validations/menu-style";
import { menuContentSchema } from "@/services/ai/schemas/menu-content";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { MenuStyleEditor } from "@/components/menu-editor/menu-style-editor";
import { WizardSteps } from "@/components/menu-generator/wizard-steps";

export const metadata: Metadata = { title: "Стиль меню — MenuMaker AI" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MenuEditorPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
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
    redirect(`/menus/${id}/review`);
  }
  if (!menu.template_id) {
    redirect(`/menus/${id}/template`);
  }

  const { data: template } = await supabase
    .from("menu_templates")
    .select("config")
    .eq("id", menu.template_id)
    .maybeSingle();

  const templateDefaults = resolveTemplateDefaults(
    template?.config as Record<string, unknown> | null,
  );

  const parsedContent = menuContentSchema.safeParse(menu.content);
  const content = parsedContent.success ? parsedContent.data : { categories: [] };

  const parsedStyleOverrides = styleOverridesSchema.safeParse(menu.style_overrides ?? {});
  const initialStyleOverrides = parsedStyleOverrides.success ? parsedStyleOverrides.data : {};

  return (
    <Container size="xl" className={`py-10 ${MENU_EDITOR_FONT_VARIABLES_CLASSNAME}`}>
      <PageHeader
        title={menu.title}
        description="Налаштуйте колір, шрифт, макет і порядок страв — зміни видно одразу в прев'ю."
      />
      <div className="mt-6 mb-8">
        <WizardSteps current="editor" />
      </div>
      <MenuStyleEditor
        menuId={menu.id}
        content={content}
        initialStyleOverrides={initialStyleOverrides}
        templateDefaults={templateDefaults}
      />
    </Container>
  );
}
