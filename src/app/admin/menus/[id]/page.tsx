import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, EyeOff } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { getAdminMenuDetail } from "@/services/admin/menus";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { MenuStatusBadge } from "@/components/dashboard/menu-status-badge";

export const metadata: Metadata = { title: "Меню — Admin Panel" };

const dateTimeFormatter = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const SOURCE_TYPE_LABEL: Record<string, string> = {
  pdf: "PDF",
  docx: "DOCX",
  xlsx: "XLSX",
  text: "Текст",
  manual: "Вручну",
};

function templateLabel(name: unknown): string {
  if (name && typeof name === "object" && !Array.isArray(name)) {
    const record = name as Record<string, unknown>;
    const value = record.uk ?? record.en;
    if (typeof value === "string") return value;
  }
  return "—";
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminMenuDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "admin") {
    redirect("/dashboard?error=forbidden");
  }

  const { id } = await params;
  const supabase = await createClient();
  const menu = await getAdminMenuDetail(supabase, id);
  if (!menu) {
    notFound();
  }

  return (
    <Container size="md" className="py-10">
      <Link
        href="/admin/menus"
        className="text-body-sm text-foreground-secondary hover:text-foreground mb-4 flex items-center gap-1.5"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        До списку меню
      </Link>
      <PageHeader
        title={menu.title}
        description={`Власник: ${menu.owner_full_name ?? menu.owner_email ?? "—"}`}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Метадані</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Статус">
            <MenuStatusBadge status={menu.status} />
          </Field>
          <Field label="Джерело">{SOURCE_TYPE_LABEL[menu.source_type] ?? menu.source_type}</Field>
          <Field label="Шаблон">{templateLabel(menu.template_name)}</Field>
          <Field label="Мова">{menu.locale}</Field>
          <Field label="Публічний">
            <Badge variant={menu.is_public ? "success" : "neutral"}>
              {menu.is_public ? "Так" : "Ні"}
            </Badge>
          </Field>
          <Field label="Створено">{dateTimeFormatter.format(new Date(menu.created_at))}</Field>
          <Field label="Оновлено">{dateTimeFormatter.format(new Date(menu.updated_at))}</Field>
          <Field label="Власник (email)">{menu.owner_email ?? "—"}</Field>
        </CardContent>
      </Card>

      <div className="border-border bg-surface-secondary mt-6 flex items-start gap-3 rounded-lg border p-4">
        <EyeOff className="text-foreground-tertiary mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p className="text-body-sm text-foreground-secondary">
          Вміст меню (страви, ціни, оформлення) не відображається в Admin Panel — це приватні дані
          користувача. Тут доступні лише метадані для потреб підтримки.
        </p>
      </div>
    </Container>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-caption text-foreground-tertiary">{label}</p>
      <div className="text-body-sm text-foreground mt-0.5">{children}</div>
    </div>
  );
}
