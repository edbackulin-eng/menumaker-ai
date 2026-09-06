import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { isDemoMode } from "@/config/demo";
import { DEMO_PREVIEW_SLIDES, type DemoSlideSpec } from "@/config/demo-menu-preview";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { resolveEffectiveStyle, resolveTemplateDefaults } from "@/lib/utils/resolve-menu-style";
import { styleOverridesSchema } from "@/lib/validations/menu-style";
import { getDashboardSummary } from "@/services/dashboard/get-summary";
import { assertMenuCreationEligible } from "@/services/menu-generator/menu-creation-credit";
import type { Json } from "@/types/database.types";
import { Link, redirect } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { MenuPreviewShowcase } from "@/components/dashboard/menu-preview-showcase";
import { MyMenusView } from "@/components/dashboard/my-menus-view";

/** Interface-locale name lookup (not the content-locale lookup used once a menu exists — see template/page.tsx's own version of this) — this empty state has no menu yet, so the interface language is the only locale signal available. */
function localizedTemplateName(name: Json, locale: string, fallback: string): string {
  if (name && typeof name === "object" && !Array.isArray(name)) {
    const record = name as Record<string, Json>;
    const value = record[locale] ?? record.en;
    if (typeof value === "string") return value;
  }
  return fallback;
}

/**
 * Picks the template row a preview slide renders: the named preset when it
 * exists, otherwise any row with the right engine.
 *
 * The fallback is the point. Slugs multiplied per business type in Stage 3
 * (grid-burger / grid-pizza / grid-fresh …), so a slug-only lookup would
 * silently fall through to a default style the moment the preset set is
 * reshuffled — and the empty state would quietly show four near-identical
 * layouts instead of four distinct ones. Every engine is guaranteed at
 * least one row, so matching on engine cannot come up empty.
 */
function findPreviewTemplate<T extends { slug: string; engine: string | null }>(
  templates: T[],
  spec: DemoSlideSpec,
): T | undefined {
  return (
    templates.find((candidate) => candidate.slug === spec.preferredSlug) ??
    templates.find((candidate) => candidate.engine === spec.engine)
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.myMenus");
  return { title: t("metaTitle") };
}

const PAGE_SIZE = 12;

/** Slide labels for the DEMO_MODE carousel — prod reads template names from the DB, demo has no rows, so name the engines directly. */
const DEMO_ENGINE_LABELS: Record<string, string> = {
  "banner-two-column": "Modern",
  grid: "Grid",
  "classic-elegant": "Bistro",
  editorial: "Editorial",
};

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function MyMenusPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.myMenus");

  const user = await getCurrentUser();
  if (!user) {
    return redirect({ href: "/login", locale });
  }

  // Demo: render the empty-state showcase (the 3D layout carousel) with zero
  // Supabase access. Returns BEFORE createClient() below. The four slide
  // styles come from resolveTemplateDefaults with a null template source —
  // i.e. each engine's built-in defaults — instead of the `menu_templates`
  // rows the prod path reads. The "Create first menu" button stays visible
  // but its /menus/new target renders the demo stub (see menus/new/page.tsx).
  if (isDemoMode) {
    const previewSlides = DEMO_PREVIEW_SLIDES.map((spec) => ({
      id: spec.engine,
      label: DEMO_ENGINE_LABELS[spec.engine] ?? spec.engine,
      style: resolveTemplateDefaults({ config: null, engine: spec.engine, palette: null }),
    }));
    return (
      <Container size="xl" className="py-5">
        <EmptyState
          className="mt-6 gap-4 px-4 py-10 sm:px-8"
          previewClassName="w-full"
          preview={<MenuPreviewShowcase slides={previewSlides} />}
          title={t("emptyTitle")}
          titleClassName="text-h4"
          description={t("emptyDescription")}
          action={
            <Link href="/menus/new" className={buttonVariants({ size: "lg" })}>
              {t("createFirst")}
            </Link>
          }
        />
      </Container>
    );
  }

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const [{ data: menus, count }, { data: templates }, eligibility, summary] = await Promise.all([
    supabase
      .from("menus")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(from, to),
    supabase.from("menu_templates").select("id, slug, name, config, engine, palette"),
    assertMenuCreationEligible(user.id)
      .then(() => true)
      .catch(() => false),
    // Same call the layout makes for the sidebar; React's cache() around
    // getCurrentUser doesn't extend here, but this is the one query set the
    // metadata line ("N menus · 1 free menu left") needs, run in parallel
    // with the rest rather than after them.
    getDashboardSummary(supabase, user.id),
  ]);

  // Both halves of a template's style identity travel together: `config`
  // (the classic engine's fields) and `engine` (which render tree runs).
  // Keeping them in one entry means a caller cannot resolve one without the
  // other and silently get the wrong tree.
  const templateStyleSourceById = new Map(
    (templates ?? []).map((template) => [
      template.id,
      {
        config: template.config as Record<string, unknown>,
        engine: template.engine,
        palette: template.palette as Record<string, unknown> | null,
      },
    ]),
  );

  const defaultTemplateName = t("emptyPreviewTemplateFallback");
  const previewSlides = DEMO_PREVIEW_SLIDES.map((spec) => {
    const template = findPreviewTemplate(templates ?? [], spec);
    return {
      id: spec.engine,
      label: localizedTemplateName(template?.name ?? null, locale, defaultTemplateName),
      style: resolveTemplateDefaults({
        config: template?.config as Record<string, unknown> | null,
        // The spec's engine wins over the row's own: the slide's whole
        // purpose is to show *this* engine, so a preferred-slug miss must
        // not quietly demote the slide to whatever engine it landed on.
        engine: spec.engine,
        palette: template?.palette as Record<string, unknown> | null,
      }),
    };
  });

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const templateNameById = new Map(
    (templates ?? []).map((template) => [
      template.id,
      localizedTemplateName(template.name, locale, defaultTemplateName),
    ]),
  );

  const items = (menus ?? []).map((menu) => {
    const styleSource = menu.template_id
      ? templateStyleSourceById.get(menu.template_id)
      : undefined;
    const parsedStyle = styleOverridesSchema.safeParse(menu.style_overrides ?? {});
    const styleOverrides = parsedStyle.success ? parsedStyle.data : {};
    return {
      menu,
      style: resolveEffectiveStyle(resolveTemplateDefaults(styleSource), styleOverrides),
      templateName: menu.template_id
        ? (templateNameById.get(menu.template_id) ?? defaultTemplateName)
        : defaultTemplateName,
    };
  });

  const freeMenusLeft = Math.max(0, summary.freeMenuLimit - summary.freeMenusUsed);

  return (
    <Container size="xl" className="py-5">
      {!eligibility && (
        <div className="border-warning-400/30 bg-warning-50 text-body-sm text-warning-600 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3">
          <span>{t("freeTrialExhausted")}</span>
          <Link href="/dashboard/credits" className="font-medium underline underline-offset-2">
            {t("viewCredits")}
          </Link>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          className="mt-6 gap-4 px-4 py-10 sm:px-8"
          // No max-width override here: MenuPreviewCarousel caps its own
          // width (`max-w-5xl`) and derives its scale from the measured
          // result, so it fills whatever room this slot gives it up to
          // that cap instead of sitting fixed at a size tuned for one
          // screen width.
          previewClassName="w-full"
          preview={<MenuPreviewShowcase slides={previewSlides} />}
          title={t("emptyTitle")}
          titleClassName="text-h4"
          description={t("emptyDescription")}
          action={
            eligibility ? (
              <Link href="/menus/new" className={buttonVariants({ size: "lg" })}>
                {t("createFirst")}
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <MyMenusView
            items={items}
            totalCount={total}
            freeMenusLeft={freeMenusLeft}
            canCreate={eligibility}
          />

          {totalPages > 1 && (
            <nav
              className="mt-8 flex items-center justify-center gap-2"
              aria-label={t("paginationAria")}
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <Link
                  key={pageNumber}
                  href={`/dashboard?page=${pageNumber}`}
                  className={
                    pageNumber === page
                      ? "bg-accent-600 flex size-9 items-center justify-center rounded-md text-white"
                      : "border-border hover:bg-surface-secondary flex size-9 items-center justify-center rounded-md border"
                  }
                  aria-current={pageNumber === page ? "page" : undefined}
                >
                  {pageNumber}
                </Link>
              ))}
            </nav>
          )}
        </>
      )}
    </Container>
  );
}
