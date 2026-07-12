import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError } from "@/lib/errors";
import { renderMenuPng } from "@/lib/export/render-menu-png";
import { logger } from "@/lib/logger";
import { menuIdParamSchema } from "@/lib/validations/menu";
import { loadExportableMenu } from "@/services/export/load-menu";
import { logMenuExport, uploadExportFile } from "@/services/export/storage";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const POST = withApiHandler<RouteContext>(
  async (_request, { params }) => {
    const { user, supabase } = await requireAuth();
    const { id } = validateParams(await params, menuIdParamSchema);

    const menu = await loadExportableMenu(supabase, user.id, id);

    let pngBuffer: Buffer;
    try {
      pngBuffer = await renderMenuPng(menu);
    } catch (err) {
      logger.error({ err, menuId: id }, "menu_png_render_failed");
      throw new ApiError(500, "export_render_failed", "Не вдалося згенерувати зображення меню.");
    }

    const fileUrl = await uploadExportFile(user.id, id, "png", pngBuffer, "image/png", "png");
    await logMenuExport(supabase, user.id, id, "png", fileUrl);

    return apiSuccess({ url: fileUrl });
  },
  { rateLimitTier: "export" },
);
