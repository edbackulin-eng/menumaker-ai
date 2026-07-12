import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MENU_EDITOR_FONT_VARIABLES_CLASSNAME } from "@/lib/fonts/menu-fonts";
import { createClient } from "@/lib/supabase/server";
import { applyStyleOrder } from "@/lib/utils/menu-content-order";
import { resolveEffectiveStyle, resolveTemplateDefaults } from "@/lib/utils/resolve-menu-style";
import { styleOverridesSchema } from "@/lib/validations/menu-style";
import { menuContentSchema } from "@/services/ai/schemas/menu-content";
import { MenuStaticView } from "@/components/menu-render/menu-static-view";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Shared by generateMetadata and the page itself (Next.js dedupes fetches
 * with the same arguments within a single request via React's `cache()`,
 * but that only helps identical `fetch()` calls — a raw Supabase query
 * isn't automatically deduped, so both call sites go through this one
 * function to at least keep the query itself in one place). Returns `null`
 * for anything that isn't a genuinely public, existing menu — the RLS
 * policy backing this query (`is_public = true or user_id = auth.uid() or
 * is_admin()`, Stage 2) already makes a private menu physically
 * unreachable for an anonymous visitor, but this still checks explicitly so
 * the 404 path doesn't depend on RLS alone.
 */
async function getPublicMenu(slug: string) {
  const supabase = await createClient();
  const { data: menu } = await supabase
    .from("menus")
    .select("id, title, content, style_overrides, template_id, locale, is_public")
    .eq("public_slug", slug)
    .maybeSingle();

  if (!menu || !menu.is_public) {
    return null;
  }

  const { data: template } = menu.template_id
    ? await supabase
        .from("menu_templates")
        .select("config")
        .eq("id", menu.template_id)
        .maybeSingle()
    : { data: null };

  return { menu, template };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicMenu(slug);
  if (!result) {
    return { title: "Меню не знайдено — MenuMaker AI" };
  }

  const { menu } = result;
  const title = `${menu.title} — меню`;
  const description = "Перегляньте меню — створено на MenuMaker AI.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    // Public menus are working pages for real businesses, not marketing
    // content of ours — leave indexing/crawling policy to a future SEO
    // stage rather than guessing at one now.
  };
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPublicMenu(slug);
  if (!result) {
    notFound();
  }

  const { menu, template } = result;

  const parsedContent = menuContentSchema.safeParse(menu.content);
  const content = parsedContent.success ? parsedContent.data : { categories: [] };

  const parsedStyleOverrides = styleOverridesSchema.safeParse(menu.style_overrides ?? {});
  const styleOverrides = parsedStyleOverrides.success ? parsedStyleOverrides.data : {};

  const templateDefaults = resolveTemplateDefaults(
    template?.config as Record<string, unknown> | null,
  );
  const effectiveStyle = resolveEffectiveStyle(templateDefaults, styleOverrides);
  const orderedContent = applyStyleOrder(content, styleOverrides);

  return (
    <div className={`bg-background min-h-full py-6 ${MENU_EDITOR_FONT_VARIABLES_CLASSNAME}`}>
      <div className="mx-auto max-w-2xl px-4">
        <h1 className="text-h4 text-foreground mb-4">{menu.title}</h1>
        {/*
          A visitor here is very likely on a phone (QR code at a table) —
          the editor's own multi-column layout (up to 3) is a desktop-preview
          choice that doesn't fit a narrow screen. Forced back to 1 column
          below `sm` via an !important override rather than touching
          MenuStaticView's own `columns` inline style (kept prop-driven,
          unchanged, for consistency with the editor).
        */}
        <div className="max-sm:*:!columns-1">
          <MenuStaticView
            content={orderedContent}
            accentColorId={effectiveStyle.accentColorId}
            fontId={effectiveStyle.fontId}
            columns={effectiveStyle.columns}
          />
        </div>
      </div>
    </div>
  );
}
