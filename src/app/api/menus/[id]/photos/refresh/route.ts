import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { menuIdParamSchema } from "@/lib/validations/menu";
import { refreshStockPhotos } from "@/services/photos/refresh-stock-photos";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Re-picks stock dish photos for the whole menu using its current venue
 * type's motif — the explicit user action behind the editor's "re-pick
 * photos" button.
 *
 * Deliberately user-triggered rather than automatic on venue-type change:
 * it rewrites content the user can see, and it spends the shared Pexels
 * quota once per dish. Owner-uploaded photos are never replaced (see
 * refreshStockPhotos).
 *
 * Rate-limited on the `export` tier rather than `authenticated`: like an
 * export, one call fans out into many provider requests, so it belongs
 * with the other expensive-per-call endpoints rather than with cheap CRUD.
 */
export const POST = withApiHandler<RouteContext>(
  async (_request, { params }) => {
    const { user, supabase } = await requireAuth();
    const { id } = validateParams(await params, menuIdParamSchema);

    const result = await refreshStockPhotos(supabase, user.id, id);

    return apiSuccess({
      replaced: result.replaced,
      skippedOwnUploads: result.skippedOwnUploads,
      unchanged: result.unchanged,
      content: result.content,
    });
  },
  { rateLimitTier: "export" },
);
