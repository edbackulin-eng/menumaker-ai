import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { isLocaleId } from "@/config/profile";
import { routing } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { RootShell } from "@/app/root-shell";

export const metadata: Metadata = {
  title: "Адмін-панель — MenuMaker AI",
  description: "Адміністративна панель MenuMaker AI.",
};

/**
 * `/admin` lives outside the `[locale]` segment on purpose (Stage 12: the
 * admin panel stays Ukrainian regardless of the visitor's interface
 * language, an earlier product decision this stage doesn't revisit) — so
 * this is now a top-level root layout in its own right and owns the
 * `<html>`/`<body>` shell via `RootShell` (see Stage 12 report for why
 * there's no longer a single shared root layout above it).
 *
 * proxy.ts already redirects non-admins away from /admin (optimistic
 * check, Stage 4); this re-verifies authoritatively against the database,
 * the same "proxy is a fast redirect, the page/layout is the real gate"
 * pattern used by every protected route since Stage 4.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    // "/login" and "/dashboard" now live under `[locale]` — resolving the
    // locale directly here avoids bouncing through next-intl's own
    // auto-detection redirect (same fix as proxy.ts's admin guard).
    const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
    const locale = cookieLocale && isLocaleId(cookieLocale) ? cookieLocale : routing.defaultLocale;
    redirect(user ? `/${locale}/dashboard?error=forbidden` : `/${locale}/login`);
  }

  return (
    <RootShell lang="uk">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader fullName={user.full_name} email={user.email} avatarUrl={user.avatar_url} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </RootShell>
  );
}
