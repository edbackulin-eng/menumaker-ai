import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("nav");

  return (
    <main className="bg-background flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex w-full max-w-sm items-center justify-between gap-4">
        <Link href="/" className="text-h6 text-foreground font-semibold">
          {t("brand")}
        </Link>
        <LocaleSwitcher />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
