import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { CURATED_FONTS, isAccentColorId, isFontId } from "@/config/menu-style";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { styleOverridesSchema } from "@/lib/validations/menu-style";
import { assertMenuCreationEligible } from "@/services/menu-generator/menu-creation-credit";
import { buttonVariants } from "@/components/ui/button-variants";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { MenuCard } from "@/components/dashboard/menu-card";

export const metadata: Metadata = { title: "Мої меню — MenuMaker AI" };

const PAGE_SIZE = 12;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function MyMenusPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
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
    <Container size="xl" className="py-10">
      <PageHeader
        title="Мої меню"
        description={`${total} ${total === 1 ? "меню" : "меню"}`}
        actions={
          eligibility ? (
            <Link href="/menus/new" className={buttonVariants()}>
              <Plus className="size-4" aria-hidden="true" />
              Створити нове меню
            </Link>
          ) : undefined
        }
      />

      {!eligibility && (
        <div className="border-warning-400/30 bg-warning-50 text-body-sm text-warning-600 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3">
          <span>
            Безкоштовну спробу вичерпано, і на балансі немає кредитів для створення нового меню.
          </span>
          <Link href="/dashboard/credits" className="font-medium underline underline-offset-2">
            Переглянути кредити
          </Link>
        </div>
      )}

      {(menus ?? []).length === 0 ? (
        <EmptyState
          className="mt-10"
          title="Ще немає жодного меню"
          description="Завантажте файл або вставте текст меню — AI розпізнає категорії, страви й ціни за лічені секунди."
          action={
            eligibility ? (
              <Link href="/menus/new" className={buttonVariants()}>
                Створити перше меню
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                  fontLabel={fontLabel}
                />
              );
            })}
          </div>

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Пагінація">
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
