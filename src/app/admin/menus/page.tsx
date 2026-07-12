import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createServiceClient } from "@/lib/supabase/service";
import { listAdminMenus } from "@/services/admin/menus";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { MenusFilterBar } from "@/components/admin/menus-filter-bar";
import { MenusTable } from "@/components/admin/menus-table";
import type { Database } from "@/types/database.types";

export const metadata: Metadata = { title: "Меню — Admin Panel" };

const PAGE_SIZE = 20;
const VALID_STATUSES = ["draft", "processing", "completed", "failed"] as const;

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminMenusPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "admin") {
    redirect("/dashboard?error=forbidden");
  }

  const { page: pageParam, status: statusParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const status = VALID_STATUSES.includes(statusParam as (typeof VALID_STATUSES)[number])
    ? (statusParam as Database["public"]["Enums"]["menu_status"])
    : undefined;

  const { items, total } = await listAdminMenus(createServiceClient(), {
    status,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <Container size="lg" className="py-10">
      <PageHeader title="Меню" description={`Усього: ${total}`} />

      <div className="mt-6">
        <MenusFilterBar initialStatus={status ?? "all"} />
      </div>

      <div className="mt-4">
        <MenusTable menus={items} />
      </div>

      <AdminPagination
        page={page}
        limit={PAGE_SIZE}
        total={total}
        buildHref={(p) => {
          const params = new URLSearchParams();
          if (status) params.set("status", status);
          params.set("page", String(p));
          return `/admin/menus?${params.toString()}`;
        }}
      />
    </Container>
  );
}
