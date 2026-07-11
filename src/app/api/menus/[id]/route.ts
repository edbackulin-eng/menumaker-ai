import type { NextRequest } from "next/server";

import { requireAuth } from "@/lib/api/require-auth";
import { apiNoContent, apiSuccess } from "@/lib/api/respond";
import { validateBody, validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError, NotFoundError } from "@/lib/errors";
import { menuIdParamSchema, updateMenuSchema } from "@/lib/validations/menu";
import type { Json } from "@/types/database.types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withApiHandler<RouteContext>(
  async (_request, { params }) => {
    const { user, supabase } = await requireAuth();
    const { id } = validateParams(await params, menuIdParamSchema);

    const { data, error } = await supabase
      .from("menus")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      throw new ApiError(500, "db_error", "Не вдалося отримати меню.");
    }
    if (!data) {
      throw new NotFoundError("Меню не знайдено.");
    }

    return apiSuccess(data);
  },
  { rateLimitTier: "authenticated" },
);

export const PATCH = withApiHandler<RouteContext>(
  async (request: NextRequest, { params }) => {
    const { user, supabase } = await requireAuth();
    const { id } = validateParams(await params, menuIdParamSchema);
    const input = await validateBody(request, updateMenuSchema);

    // `content` is validated as a plain object by updateMenuSchema; cast to
    // Json here since zod's Record<string, unknown> isn't structurally
    // provable as the recursive Json type to the compiler.
    const { data, error } = await supabase
      .from("menus")
      .update({ ...input, content: input.content as Json | undefined })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) {
      throw new ApiError(500, "db_error", "Не вдалося оновити меню.");
    }
    if (!data) {
      throw new NotFoundError("Меню не знайдено.");
    }

    return apiSuccess(data);
  },
  { rateLimitTier: "authenticated" },
);

export const DELETE = withApiHandler<RouteContext>(
  async (_request, { params }) => {
    const { user, supabase } = await requireAuth();
    const { id } = validateParams(await params, menuIdParamSchema);

    // Hard delete — see docs/api-conventions.md for why (menu_exports
    // already cascades via its FK from Stage 2).
    const { data, error } = await supabase
      .from("menus")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new ApiError(500, "db_error", "Не вдалося видалити меню.");
    }
    if (!data) {
      throw new NotFoundError("Меню не знайдено.");
    }

    return apiNoContent();
  },
  { rateLimitTier: "authenticated" },
);
