import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError } from "@/lib/errors";
import { renderMenuPdf } from "@/lib/export/render-menu-pdf";
import { logger } from "@/lib/logger";
import { menuIdParamSchema } from "@/lib/validations/menu";
import { loadExportableMenu } from "@/services/export/load-menu";
import { logMenuExport, uploadExportFile } from "@/services/export/storage";

// Font embedding, multi-page layout, and (for photo-led engines) remote
// image downloads can push this well past Vercel's default function
// timeout — set explicitly rather than discovered via a production timeout.
export const maxDuration = 60;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const POST = withApiHandler<RouteContext>(
  async (_request, { params }) => {
    const { user, supabase } = await requireAuth();
    const { id } = validateParams(await params, menuIdParamSchema);

    const menu = await loadExportableMenu(supabase, user.id, id);

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await renderMenuPdf(menu);
    } catch (err) {
      logger.error({ err, menuId: id }, "menu_pdf_render_failed");
      throw new ApiError(500, "export_render_failed", "Не вдалося згенерувати PDF меню.");
    }

    const fileUrl = await uploadExportFile(user.id, id, "pdf", pdfBuffer, "application/pdf", "pdf");
    await logMenuExport(supabase, user.id, id, "pdf", fileUrl);

    return apiSuccess({ url: fileUrl });
  },
  { rateLimitTier: "export" },
);
