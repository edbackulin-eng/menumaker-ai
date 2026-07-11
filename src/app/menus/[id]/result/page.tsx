import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { WizardSteps } from "@/components/menu-generator/wizard-steps";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { menuContentSchema } from "@/services/ai/schemas/menu-content";

export const metadata: Metadata = { title: "Меню готове — MenuMaker AI" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MenuResultPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data: menu } = await supabase
    .from("menus")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!menu) {
    notFound();
  }

  if (menu.status !== "completed") {
    redirect(`/menus/${id}/template`);
  }

  const parsedContent = menuContentSchema.safeParse(menu.content);
  const categoryCount = parsedContent.success ? parsedContent.data.categories.length : 0;
  const itemCount = parsedContent.success
    ? parsedContent.data.categories.reduce((sum, category) => sum + category.items.length, 0)
    : 0;

  return (
    <Container size="md" className="py-10">
      <PageHeader title="Меню готове!" description={menu.title} />
      <div className="mt-6 mb-8">
        <WizardSteps current="result" />
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <p className="text-body text-foreground-secondary">
            Меню «{menu.title}» успішно створено: {categoryCount} категорій, {itemCount} страв.
          </p>
          <p className="text-body-sm text-foreground-secondary">
            Редагування вигляду, експорт (PDF/PNG/Web/QR) та повний список ваших меню
            з&apos;являться на наступних етапах.
          </p>
          <Link href="/dashboard" className={buttonVariants({ className: "self-start" })}>
            Перейти до кабінету
          </Link>
        </CardContent>
      </Card>
    </Container>
  );
}
