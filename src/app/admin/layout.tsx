import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

/**
 * proxy.ts already redirects non-admins away from /admin (optimistic
 * check, Stage 4); this re-verifies authoritatively against the database,
 * the same "proxy is a fast redirect, the page/layout is the real gate"
 * pattern used by every protected route since Stage 4.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "admin") {
    redirect("/dashboard?error=forbidden");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader fullName={user.full_name} email={user.email} avatarUrl={user.avatar_url} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
