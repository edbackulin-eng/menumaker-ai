import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { getDashboardSummary } from "@/services/dashboard/get-summary";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardMobileNav } from "@/components/dashboard/dashboard-mobile-nav";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // proxy.ts already redirects unauthenticated requests away from /dashboard
  // (optimistic check); this re-verifies authoritatively, same pattern used
  // by every protected page since Stage 4.
  const user = await getCurrentUser();
  if (!user) {
    return redirect({ href: "/login", locale });
  }

  // Every dashboard page mounts this layout, so the sidebar's credits
  // badge/quick-action needs this fetched here rather than per-page — one
  // extra query on every dashboard navigation, same tradeoff already made
  // for auth (getCurrentUser runs per-layout too, deduped via React
  // cache() within a request).
  const supabase = await createClient();
  const summary = await getDashboardSummary(supabase, user.id);

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar creditBlock={summary.creditBlock} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader fullName={user.full_name} email={user.email} avatarUrl={user.avatar_url} />
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
      <DashboardMobileNav />
    </div>
  );
}
