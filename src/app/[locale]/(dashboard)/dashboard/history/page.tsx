import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { Link, redirect } from "@/i18n/navigation";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { TransactionList } from "@/components/dashboard/transaction-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.history");
  return { title: t("metaTitle") };
}

const PAGE_SIZE = 20;

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function HistoryPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("dashboard.history");

  const user = await getCurrentUser();
  if (!user) {
    return redirect({ href: "/login", locale });
  }

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data, count } = await supabase
    .from("credits_transactions")
    .select("id, amount, type, description, created_at, related_menu_id, menus(title)", {
      count: "exact",
    })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  const transactions = (data ?? []).map((row) => ({
    id: row.id,
    amount: row.amount,
    type: row.type,
    description: row.description,
    created_at: row.created_at,
    related_menu_id: row.related_menu_id,
    related_menu_title: row.menus?.title ?? null,
  }));

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Container size="lg" className="py-10">
      <PageHeader title={t("title")} description={t("subtitle")} />
      <div className="mt-6">
        <TransactionList transactions={transactions} />
      </div>

      {totalPages > 1 && (
        <nav
          className="mt-8 flex items-center justify-center gap-2"
          aria-label={t("paginationAria")}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <Link
              key={pageNumber}
              href={`/dashboard/history?page=${pageNumber}`}
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
    </Container>
  );
}
