import type { NextRequest } from "next/server";

import { requireAuth } from "@/lib/api/require-auth";
import { apiPaginated, apiSuccess } from "@/lib/api/respond";
import { validateBody, validateQuery } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError } from "@/lib/errors";
import { createMenuSchema, listMenusQuerySchema } from "@/lib/validations/menu";

export const GET = withApiHandler(
  async (request: NextRequest) => {
    const { user, supabase } = await requireAuth();
    const { page, limit } = validateQuery(request, listMenusQuerySchema);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("menus")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw new ApiError(500, "db_error", "Не вдалося отримати список меню.");
    }

    return apiPaginated(data ?? [], page, limit, count ?? 0);
  },
  { rateLimitTier: "authenticated" },
);

export const POST = withApiHandler(
  async (request: NextRequest) => {
    const { user, supabase } = await requireAuth();
    const input = await validateBody(request, createMenuSchema);

    const { data, error } = await supabase
      .from("menus")
      .insert({
        user_id: user.id,
        title: input.title,
        template_id: input.template_id ?? null,
      })
      .select()
      .single();

    if (error) {
      throw new ApiError(500, "db_error", "Не вдалося створити меню.");
    }

    return apiSuccess(data, 201);
  },
  { rateLimitTier: "authenticated" },
);
