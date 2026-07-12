"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil } from "lucide-react";

import { ApiClientError } from "@/lib/api-client/api-client-error";
import { adminApi, type AdminTemplate } from "@/lib/api-client/admin";
import { Switch } from "@/components/ui/switch";
import { TemplateEditModal } from "@/components/admin/template-edit-modal";

function nameField(name: unknown): string {
  if (name && typeof name === "object" && !Array.isArray(name)) {
    const record = name as Record<string, unknown>;
    const value = record.uk ?? record.en;
    if (typeof value === "string") return value;
  }
  return "—";
}

export interface TemplatesTableProps {
  templates: AdminTemplate[];
}

export function TemplatesTable({ templates }: TemplatesTableProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminTemplate | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleToggleActive(template: AdminTemplate, nextActive: boolean) {
    setError(null);
    setTogglingId(template.id);
    try {
      await adminApi.updateTemplate(template.id, { is_active: nextActive });
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Не вдалося оновити шаблон.");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <>
      {error && <p className="text-body-sm text-error-600 mb-3">{error}</p>}
      <div className="border-border overflow-x-auto rounded-lg border">
        <table className="w-full text-left">
          <thead className="bg-surface-secondary text-caption text-foreground-tertiary">
            <tr>
              <th className="px-4 py-2.5 font-medium">Назва</th>
              <th className="px-4 py-2.5 font-medium">Категорія</th>
              <th className="px-4 py-2.5 font-medium">Порядок</th>
              <th className="px-4 py-2.5 font-medium">Активний</th>
              <th className="px-4 py-2.5 font-medium">
                <span className="sr-only">Дії</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {templates.map((template) => (
              <tr key={template.id}>
                <td className="text-body-sm text-foreground px-4 py-3 font-medium">
                  {nameField(template.name)}
                </td>
                <td className="text-body-sm text-foreground-secondary px-4 py-3">
                  {template.category}
                </td>
                <td className="text-body-sm text-foreground-secondary px-4 py-3">
                  {template.sort_order}
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={template.is_active}
                    disabled={togglingId === template.id}
                    onCheckedChange={(checked) => void handleToggleActive(template, checked)}
                    aria-label={`Активність шаблону ${nameField(template.name)}`}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(template)}
                    className="text-foreground-tertiary hover:bg-surface-secondary hover:text-foreground -m-1 flex size-7 items-center justify-center rounded-md"
                    aria-label={`Редагувати ${nameField(template.name)}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <TemplateEditModal
          open={Boolean(editing)}
          onOpenChange={(open) => !open && setEditing(null)}
          template={editing}
        />
      )}
    </>
  );
}
