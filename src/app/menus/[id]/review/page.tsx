import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { MenuReviewEditor } from "@/components/menu-generator/menu-review-editor";
import { WizardSteps } from "@/components/menu-generator/wizard-steps";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { menuContentSchema } from "@/services/ai/schemas/menu-content";

export const metadata: Metadata = { title: "Перегляд меню — MenuMaker AI" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MenuReviewPage({ params }: PageProps) {
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

  if (menu.status === "processing") {
    // The import request is still running (or crashed mid-flight) —
    // nothing to review yet.
    redirect(`/menus/new`);
  }

  // Already confirmed on a previous visit — Review is edit-before-confirm,
  // so a confirmed menu belongs on the next step.
  if (menu.content_confirmed_at) {
    redirect(`/menus/${id}/template`);
  }

  const parsedContent = menuContentSchema.safeParse(menu.content);
  const initialContent = parsedContent.success ? parsedContent.data : { categories: [] };

  return (
    <Container size="lg" className="py-10">
      <PageHeader
        title={menu.title}
        description="Перевірте розпізнані категорії, страви й ціни — виправте чи додайте, якщо AI щось пропустив."
      />
      <div className="mt-6 mb-8">
        <WizardSteps current="review" />
      </div>
      <MenuReviewEditor menuId={menu.id} initialContent={initialContent} />
    </Container>
  );
}
