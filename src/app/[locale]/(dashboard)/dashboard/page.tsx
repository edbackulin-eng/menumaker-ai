import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";

import { CURATED_FONTS, isAccentColorId, isFontId } from "@/config/menu-style";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { styleOverridesSchema } from "@/lib/validations/menu-style";
import { assertMenuCreationEligible } from "@/services/menu-generator/menu-creation-credit";
import { Link, redirect } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { MenuCard } from "@/components/dashboard/menu-card";
import { MenuTemplatePreviewMockups } from "@/components/dashboard/menu-template-preview-mockups";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.myMenus");
  return { title: t("metaTitle") };
}

const PAGE_SIZE = 12;

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

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const [{ data: menus, count }, { data: templates }, eligibility] = await Promise.all([
    supabase
      .from("menus")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(from, to),
    supabase.from("menu_templates").select("id, config"),
    assertMenuCreationEligible(user.id)
      .then(() => true)
      .catch(() => false),
  ]);

  const templateConfigById = new Map(
    (templates ?? []).map((template) => [template.id, template.config as Record<string, unknown>]),
  );

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Container size="xl" className="py-8">
      <PageHeader
        title={t("title")}
        description={t("count", { count: total })}
        actions={
          eligibility ? (
            <Link href="/menus/new" className={buttonVariants()}>
              <Plus className="size-4" aria-hidden="true" />
              {t("createNew")}
            </Link>
          ) : undefined
        }
      />

      {!eligibility && (
        <div className="border-warning-400/30 bg-warning-50 text-body-sm text-warning-600 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3">
          <span>{t("freeTrialExhausted")}</span>
          <Link href="/dashboard/credits" className="font-medium underline underline-offset-2">
            {t("viewCredits")}
          </Link>
        </div>
      )}

      {(menus ?? []).length === 0 ? (
        <EmptyState
          className="mt-8"
          preview={<MenuTemplatePreviewMockups />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={
            eligibility ? (
              <Link href="/menus/new" className={buttonVariants()}>
                {t("createFirst")}
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {(menus ?? []).map((menu) => {
              const config = menu.template_id
                ? templateConfigById.get(menu.template_id)
                : undefined;
              const parsedStyle = styleOverridesSchema.safeParse(menu.style_overrides ?? {});
              const styleOverrides = parsedStyle.success ? parsedStyle.data : {};

              const defaultAccentColorId =
                typeof config?.defaultAccentColorId === "string" &&
                isAccentColorId(config.defaultAccentColorId)
                  ? config.defaultAccentColorId
                  : "charcoal";
              const defaultFontId =
                typeof config?.defaultFontId === "string" && isFontId(config.defaultFontId)
                  ? config.defaultFontId
                  : "inter";

              const accentColorId = styleOverrides.accentColorId ?? defaultAccentColorId;
              const fontId = styleOverrides.fontId ?? defaultFontId;
              const fontLabel = CURATED_FONTS.find((font) => font.id === fontId)?.label ?? "Inter";

              return (
                <MenuCard
                  key={menu.id}
                  menu={menu}
                  accentColorId={accentColorId}
                  fontId={fontId}
                  fontLabel={fontLabel}
                />
              );
            })}
          </div>

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
                      ? "bg-accent-400 flex size-9 items-center justify-center rounded-md text-white"
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
