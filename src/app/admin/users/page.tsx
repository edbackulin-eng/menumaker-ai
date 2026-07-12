import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createServiceClient } from "@/lib/supabase/service";
import { listAdminUsers } from "@/services/admin/users";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { UsersFilterBar } from "@/components/admin/users-filter-bar";
import { UsersTable } from "@/components/admin/users-table";

export const metadata: Metadata = { title: "Користувачі — Admin Panel" };

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; role?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "admin") {
    redirect("/dashboard?error=forbidden");
  }

  const { page: pageParam, search, role: roleParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const role = roleParam === "user" || roleParam === "admin" ? roleParam : undefined;

  const { items, total } = await listAdminUsers(createServiceClient(), {
    search,
    role,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <Container size="lg" className="py-10">
      <PageHeader title="Користувачі" description={`Усього: ${total}`} />

      <div className="mt-6">
        <UsersFilterBar initialSearch={search ?? ""} initialRole={role ?? "all"} />
      </div>

      <div className="mt-4">
        <UsersTable users={items} currentAdminId={user.id} />
      </div>

      <AdminPagination
        page={page}
        limit={PAGE_SIZE}
        total={total}
        buildHref={(p) => {
          const params = new URLSearchParams();
          if (search) params.set("search", search);
          if (role) params.set("role", role);
          params.set("page", String(p));
          return `/admin/users?${params.toString()}`;
        }}
      />
    </Container>
  );
}
