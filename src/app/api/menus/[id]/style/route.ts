import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateBody, validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError, NotFoundError } from "@/lib/errors";
import { menuIdParamSchema } from "@/lib/validations/menu";
import { styleOverridesSchema, type StyleOverridesInput } from "@/lib/validations/menu-style";
import { menuContentSchema } from "@/services/ai/schemas/menu-content";
import type { Json } from "@/types/database.types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * The interactive editor's autosave/manual-save both hit this one endpoint
 * with the *complete* current style_overrides object (not a partial diff) —
 * simpler than merge semantics, and the client already holds the full
 * object in state either way.
 */
export const PATCH = withApiHandler<RouteContext>(
  async (request, { params }) => {
    const { user, supabase } = await requireAuth();
    const { id } = validateParams(await params, menuIdParamSchema);
    const styleOverrides = await validateBody(request, styleOverridesSchema);

    const { data: menu, error: fetchError } = await supabase
      .from("menus")
      .select("id, content")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (fetchError) {
      throw new ApiError(500, "db_error", "Не вдалося отримати меню.");
    }
    if (!menu) {
      throw new NotFoundError("Меню не знайдено.");
    }

    if (styleOverrides.categoryOrder || styleOverrides.itemOrder) {
      validateOrderReferencesRealContent(menu.content, styleOverrides);
    }

    const { data, error } = await supabase
      .from("menus")
      .update({ style_overrides: styleOverrides as Json })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();
    if (error) {
      throw new ApiError(500, "db_error", "Не вдалося зберегти стиль меню.");
    }
    if (!data) {
      throw new NotFoundError("Меню не знайдено.");
    }

    return apiSuccess(data);
  },
  { rateLimitTier: "authenticated" },
);

/**
 * Beyond the curated-list checks in styleOverridesSchema, categoryOrder/
 * itemOrder ids must actually belong to this menu's *current* content — a
 * request built by hand (not through the editor UI) could otherwise
 * reference ids from a different menu or made-up values entirely.
 */
function validateOrderReferencesRealContent(
  rawContent: unknown,
  styleOverrides: StyleOverridesInput,
): void {
  const parsedContent = menuContentSchema.safeParse(rawContent);
  if (!parsedContent.success) {
    throw new ApiError(
      422,
      "content_not_ready_for_ordering",
      "Меню ще не має підтвердженого вмісту для збереження порядку елементів.",
    );
  }
  const content = parsedContent.data;

  const categoryIds = new Set(content.categories.map((category) => category.id));

  if (styleOverrides.categoryOrder) {
    const orderIds = new Set(styleOverrides.categoryOrder);
    const matches =
      orderIds.size === categoryIds.size && [...orderIds].every((id) => categoryIds.has(id));
    if (!matches) {
      throw new ApiError(
        422,
        "invalid_category_order",
        "categoryOrder не відповідає фактичним категоріям цього меню.",
      );
    }
  }

  if (styleOverrides.itemOrder) {
    for (const [categoryId, itemIds] of Object.entries(styleOverrides.itemOrder)) {
      const category = content.categories.find((c) => c.id === categoryId);
      if (!category) {
        throw new ApiError(
          422,
          "unknown_category_in_item_order",
          `itemOrder посилається на невідому категорію "${categoryId}".`,
        );
      }
      const realItemIds = new Set(category.items.map((item) => item.id));
      const orderIds = new Set(itemIds);
      const matches =
        orderIds.size === realItemIds.size && [...orderIds].every((id) => realItemIds.has(id));
      if (!matches) {
        throw new ApiError(
          422,
          "invalid_item_order",
          `itemOrder для категорії "${categoryId}" не відповідає її фактичним стравам.`,
        );
      }
    }
  }
}
