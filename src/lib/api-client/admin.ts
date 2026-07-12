import { fetchJson } from "@/lib/api-client/fetch-json";
import type {
  ChangeRoleInput,
  GrantCreditsInput,
  UpdateTemplateInput,
} from "@/lib/validations/admin";
import type { Database, Tables } from "@/types/database.types";

type UserRole = Database["public"]["Enums"]["user_role"];
type MenuStatus = Database["public"]["Enums"]["menu_status"];
type CreditTransactionType = Database["public"]["Enums"]["credit_transaction_type"];

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  free_menus_used: number;
  credits_balance: number;
  menu_count: number;
}

export interface AdminMenuRow {
  id: string;
  title: string;
  status: MenuStatus;
  owner_email: string;
  template_id: string | null;
  template_name: unknown;
  created_at: string;
}

export interface AdminMenuDetail {
  id: string;
  title: string;
  status: MenuStatus;
  source_type: Database["public"]["Enums"]["menu_source_type"];
  template_id: string | null;
  locale: string;
  is_public: boolean;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
  content_confirmed_at: string | null;
  user_id: string;
  owner_email: string | null;
  owner_full_name: string | null;
  template_name: unknown;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface DashboardStats {
  total_users: number;
  new_users_today: number;
  new_users_week: number;
  new_users_month: number;
  total_menus: number;
  free_trials_used: number;
  conversion_pct: number;
}

export interface DailyActivityPoint {
  day: string;
  new_users: number;
  new_menus: number;
}

export interface AdminDashboardData {
  stats: DashboardStats;
  activity: DailyActivityPoint[];
  recentUsers: AdminUserRow[];
}

export interface CreditsBreakdownRow {
  type: CreditTransactionType;
  total_amount: number;
  transaction_count: number;
}

export interface CreditsStats {
  totalGranted: number;
  totalSpent: number;
  breakdown: CreditsBreakdownRow[];
}

export type AdminTemplate = Pick<
  Tables<"menu_templates">,
  | "id"
  | "slug"
  | "name"
  | "category"
  | "is_active"
  | "sort_order"
  | "preview_image_url"
  | "created_at"
>;

export interface LocaleBreakdownRow {
  locale: string;
  user_count: number;
}

export interface RegistrationSourceRow {
  provider: string;
  user_count: number;
}

export interface AdminStatisticsData {
  activity: DailyActivityPoint[];
  localeBreakdown: LocaleBreakdownRow[];
  registrationSourceBreakdown: RegistrationSourceRow[];
}

export const adminApi = {
  getDashboardStats(): Promise<AdminDashboardData> {
    return fetchJson<AdminDashboardData>("/api/admin/dashboard-stats");
  },

  listUsers(params: { page?: number; limit?: number; search?: string; role?: UserRole } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.role) query.set("role", params.role);
    const qs = query.toString();
    return fetchJson<Paginated<AdminUserRow>>(`/api/admin/users${qs ? `?${qs}` : ""}`);
  },

  changeUserRole(userId: string, input: ChangeRoleInput) {
    return fetchJson<{ old_role: UserRole; new_role: UserRole }>(
      `/api/admin/users/${userId}/role`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
  },

  grantCredits(userId: string, input: GrantCreditsInput) {
    return fetchJson<{ new_balance: number }>(`/api/admin/users/${userId}/grant-credits`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  listMenus(params: { page?: number; limit?: number; status?: MenuStatus } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.status) query.set("status", params.status);
    const qs = query.toString();
    return fetchJson<Paginated<AdminMenuRow>>(`/api/admin/menus${qs ? `?${qs}` : ""}`);
  },

  getMenu(id: string): Promise<AdminMenuDetail> {
    return fetchJson<AdminMenuDetail>(`/api/admin/menus/${id}`);
  },

  getCreditsStats(): Promise<CreditsStats> {
    return fetchJson<CreditsStats>("/api/admin/credits-stats");
  },

  listTemplates(): Promise<AdminTemplate[]> {
    return fetchJson<AdminTemplate[]>("/api/admin/templates");
  },

  updateTemplate(id: string, input: UpdateTemplateInput): Promise<AdminTemplate> {
    return fetchJson<AdminTemplate>(`/api/admin/templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  getStatistics(days: 7 | 30 | 90 = 30): Promise<AdminStatisticsData> {
    return fetchJson<AdminStatisticsData>(`/api/admin/statistics?days=${days}`);
  },
};
