import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { buttonVariants } from "@/components/ui/button-variants";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Поповнення — MenuMaker AI" };

export default async function CreditsUpgradePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <Container size="md" className="py-10">
      <PageHeader title="Поповнення кредитів" />
      <EmptyState
        className="mt-6"
        icon={Sparkles}
        title="Купівля кредитів скоро буде доступна"
        description="Ми готуємо оплату через Stripe — карткою, безпечно і за кілька секунд. Слідкуйте за оновленнями."
        action={
          <Link href="/dashboard/credits" className={buttonVariants({ variant: "secondary" })}>
            Повернутись до кредитів
          </Link>
        }
      />
    </Container>
  );
}
