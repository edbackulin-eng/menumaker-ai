import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardMobileNav } from "@/components/dashboard/dashboard-mobile-nav";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // proxy.ts already redirects unauthenticated requests away from /dashboard
  // (optimistic check); this re-verifies authoritatively, same pattern used
  // by every protected page since Stage 4.
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader fullName={user.full_name} email={user.email} avatarUrl={user.avatar_url} />
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
      <DashboardMobileNav />
    </div>
  );
}
