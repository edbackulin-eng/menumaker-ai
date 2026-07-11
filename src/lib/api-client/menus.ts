import { fetchJson } from "@/lib/api-client/fetch-json";
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
};
