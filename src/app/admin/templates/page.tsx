import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { listAdminTemplates } from "@/services/admin/templates";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { TemplatesTable } from "@/components/admin/templates-table";

export const metadata: Metadata = { title: "Шаблони — Admin Panel" };

export default async function AdminTemplatesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "admin") {
    redirect("/dashboard?error=forbidden");
  }

  const supabase = await createClient();
  const templates = await listAdminTemplates(supabase);

  return (
    <Container size="lg" className="py-10">
      <PageHeader
        title="Шаблони меню"
        description="Керування назвами, активністю та порядком відображення. Дизайн/кольори шаблону тут не редагуються."
      />
      <div className="mt-6">
        <TemplatesTable templates={templates} />
      </div>
    </Container>
  );
}
