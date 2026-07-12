import { fetchJson, postFormData } from "@/lib/api-client/fetch-json";
import type { StyleOverridesInput } from "@/lib/validations/menu-style";
import type { MenuContent } from "@/services/ai/schemas/menu-content";
import type { Tables } from "@/types/database.types";

export type Menu = Tables<"menus">;

export interface PaginatedMenus {
  items: Menu[];
  page: number;
  limit: number;
  total: number;
}

export interface ListMenusParams {
  page?: number;
  limit?: number;
}

export interface CreateMenuInput {
  title: string;
  template_id?: string | null;
}

export interface UpdateMenuInput {
  title?: string;
  template_id?: string | null;
  status?: Menu["status"];
  content?: Record<string, unknown>;
  locale?: string;
}

export interface ImportMenuInput {
  title: string;
  mode: "file" | "text";
  file?: File;
  text?: string;
  locale?: string;
}

export interface ImportMenuResult extends Menu {
  usedFreeMenu: boolean;
  creditsBalance: number;
}

export const menusApi = {
  list(params: ListMenusParams = {}): Promise<PaginatedMenus> {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return fetchJson<PaginatedMenus>(`/api/menus${qs ? `?${qs}` : ""}`);
  },

  get(id: string): Promise<Menu> {
    return fetchJson<Menu>(`/api/menus/${id}`);
  },

  create(input: CreateMenuInput): Promise<Menu> {
    return fetchJson<Menu>("/api/menus", { method: "POST", body: JSON.stringify(input) });
  },

  update(id: string, input: UpdateMenuInput): Promise<Menu> {
    return fetchJson<Menu>(`/api/menus/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  },

  remove(id: string): Promise<void> {
    return fetchJson<void>(`/api/menus/${id}`, { method: "DELETE" });
  },

  import(input: ImportMenuInput): Promise<ImportMenuResult> {
    const form = new FormData();
    form.set("title", input.title);
    form.set("mode", input.mode);
    if (input.file) form.set("file", input.file);
    if (input.text) form.set("text", input.text);
    if (input.locale) form.set("locale", input.locale);
    return postFormData<ImportMenuResult>("/api/menus/import", form);
  },

  confirm(id: string, content: MenuContent): Promise<Menu> {
    return fetchJson<Menu>(`/api/menus/${id}/confirm`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  applyTemplate(id: string, templateId: string): Promise<Menu> {
    return fetchJson<Menu>(`/api/menus/${id}/apply-template`, {
      method: "POST",
      body: JSON.stringify({ template_id: templateId }),
    });
  },

  updateStyle(id: string, styleOverrides: StyleOverridesInput): Promise<Menu> {
    return fetchJson<Menu>(`/api/menus/${id}/style`, {
      method: "PATCH",
      body: JSON.stringify(styleOverrides),
    });
  },

  duplicate(id: string): Promise<Menu> {
    return fetchJson<Menu>(`/api/menus/${id}/duplicate`, { method: "POST" });
  },
};
