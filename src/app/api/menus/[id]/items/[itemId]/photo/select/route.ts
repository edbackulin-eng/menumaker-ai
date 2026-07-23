import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateBody, validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { menuItemParamsSchema, selectItemPhotoSchema } from "@/lib/validations/menu-photo";
import { updateItemPhotoUrl } from "@/services/photos/update-item-photo";

interface RouteContext {
  params: Promise<{ id: string; itemId: string }>;
}

/**
 * The only endpoint that writes a picker-grid choice into
 * `menus.content.photoUrl` — .../photo/search (the grid's data source) is
 * deliberately read-only, see that route's docstring. This is what keeps
 * the shared `dish_photos` cache neutral: a user's click here only ever
 * updates their own menu's content, never the cache row `search` reads
 * from.
 */
export const POST = withApiHandler<RouteContext>(
  async (request, { params }) => {
    const { user, supabase } = await requireAuth();
    const { id, itemId } = validateParams(await params, menuItemParamsSchema);
    const { photoUrl } = await validateBody(request, selectItemPhotoSchema);

    await updateItemPhotoUrl(supabase, user.id, id, itemId, photoUrl, "stock");
    return apiSuccess({ photoUrl });
  },
  { rateLimitTier: "authenticated" },
);
