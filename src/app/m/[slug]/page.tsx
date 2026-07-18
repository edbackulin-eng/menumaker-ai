import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { publicEnv } from "@/config/env";
import { generateQrPng } from "@/lib/export/qr";
import { MENU_EDITOR_FONT_VARIABLES_CLASSNAME } from "@/lib/fonts/menu-fonts";
import { createClient } from "@/lib/supabase/server";
import { applyStyleOrder } from "@/lib/utils/menu-content-order";
import {
  MENU_SURFACE,
  resolveEffectiveStyle,
  resolveTemplateDefaults,
  resolvePageForeground,
} from "@/lib/utils/resolve-menu-style";
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

  // This page is the restaurant's own artifact shown to its customers at a
  // table, not a page of our product — it deliberately does NOT follow the
  // application's dark theme. Hence literal menu tokens here rather than
  // `bg-background` / `text-foreground`, which went dark in Stage 14.
  //
  // `null` (not the menu's own background) is deliberate: this title sits
  // *outside* the menu card, on the neutral page canvas, so it needs the
  // canvas's foreground — #171717, exactly what `text-foreground` resolved
  // to before. Passing the template's background here would paint the title
  // white for the dark templates (Luxury/Dark/Bar) and make it vanish
  // against the light canvas.
  const canvasForeground = resolvePageForeground(null);

  // Engines with their own title banner already name the venue at 38px —
  // repeating the menu title above it would be the same words twice.
  const hasOwnBanner = effectiveStyle.layoutEngine === "banner-two-column";

  // Localized in the *menu's* content locale, not the visitor's UI locale:
  // this is the restaurant's printed artifact, and its footer should read
  // in the same language as the dishes above it.
  const t = await getTranslations({ locale: menu.locale, namespace: "menuRender.modern" });

  // Points at this very page. Redundant to scan while already here, but the
  // same render is what becomes the printed PDF/PNG, where it is the whole
  // point — generating it here keeps one code path for all three outputs.
  const qrDataUri = hasOwnBanner
    ? `data:image/png;base64,${(
        await generateQrPng(`${publicEnv.NEXT_PUBLIC_APP_URL}/m/${slug}`)
      ).toString("base64")}`
    : undefined;

  return (
    <div
      style={{ backgroundColor: MENU_SURFACE.pageBackground }}
      className={`min-h-full py-6 ${MENU_EDITOR_FONT_VARIABLES_CLASSNAME}`}
    >
      <div className="mx-auto max-w-2xl px-4">
        {!hasOwnBanner && (
          <h1 className="text-h4 mb-4" style={{ color: canvasForeground.primary }}>
            {menu.title}
          </h1>
        )}
        {/*
          A visitor here is very likely on a phone (QR code at a table) —
          the editor's own multi-column layout (up to 3) is a desktop-preview
          choice that doesn't fit a narrow screen. Forced back to 1 column
          below `sm` via an !important override rather than touching
          MenuStaticView's own `columns` inline style (kept prop-driven,
          unchanged, for consistency with the editor).

          Modern collapses to one column via its own `columns-1 sm:columns-2`
          classes, so this override is a no-op for it — left in place because
          it still governs the classic engine.
        */}
        <div className="max-sm:*:!columns-1">
          <MenuStaticView
            content={orderedContent}
            style={effectiveStyle}
            menuTitle={menu.title}
            {...(qrDataUri ? { qrDataUri } : {})}
            qrLabel={t("qrLabel")}
          />
        </div>
      </div>
    </div>
  );
}
