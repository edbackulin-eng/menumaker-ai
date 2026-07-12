import { publicEnv } from "@/config/env";
import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError } from "@/lib/errors";
import { generateQrPng } from "@/lib/export/qr";
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
    if (!menu.isPublic || !menu.publicSlug) {
      throw new ApiError(
        422,
        "menu_not_published",
        "Спочатку опублікуйте Web Menu, щоб згенерувати QR-код на нього.",
      );
    }

    const publicUrl = `${publicEnv.NEXT_PUBLIC_APP_URL}/m/${menu.publicSlug}`;
    const qrBuffer = await generateQrPng(publicUrl);

    const fileUrl = await uploadExportFile(user.id, id, "qr", qrBuffer, "image/png", "png");
    await logMenuExport(supabase, user.id, id, "qr", fileUrl);

    return apiSuccess({ url: fileUrl, targetUrl: publicUrl });
  },
  { rateLimitTier: "export" },
);
