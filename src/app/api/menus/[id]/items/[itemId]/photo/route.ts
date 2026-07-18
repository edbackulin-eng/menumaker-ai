import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { validateParams } from "@/lib/api/validate-request";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ALLOWED_PHOTO_MIME_TYPES, PHOTO_CONFIG, PHOTO_EXTENSION_BY_MIME } from "@/config/photos";
import { ApiError, NotFoundError } from "@/lib/errors";
import { menuItemParamsSchema } from "@/lib/validations/menu-photo";
import { createServiceClient } from "@/lib/supabase/service";
import { updateItemPhotoUrl } from "@/services/photos/update-item-photo";

const BUCKET = "menu-photos";

interface RouteContext {
  params: Promise<{ id: string; itemId: string }>;
}

/**
 * User-uploaded replacement for a dish's photo. Type/size are validated
 * here, server-side — the UI also restricts the file picker, but that's
 * only a convenience; a request that skips the browser entirely still
 * can't smuggle an oversized file or an unsupported type into the
 * `menu-photos` bucket.
 */
export const POST = withApiHandler<RouteContext>(
  async (request, { params }) => {
    const { user, supabase } = await requireAuth();
    const { id, itemId } = validateParams(await params, menuItemParamsSchema);

    // Confirm menu ownership before touching Storage at all — otherwise a
    // request for someone else's menu id would still write a file under
    // this user's own path prefix (harmless to others, but pointless and
    // the ownership check belongs before any side effect, not after).
    const { data: menu, error: fetchError } = await supabase
      .from("menus")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (fetchError) {
      throw new ApiError(500, "db_error", "Не вдалося отримати меню.");
    }
    if (!menu) {
      throw new NotFoundError("Меню не знайдено.");
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new ApiError(422, "file_required", "Файл обов'язковий.");
    }
    if (file.size === 0) {
      throw new ApiError(422, "empty_file", "Файл порожній.");
    }
    if (file.size > PHOTO_CONFIG.maxPhotoSizeBytes) {
      const limitMb = PHOTO_CONFIG.maxPhotoSizeBytes / (1024 * 1024);
      throw new ApiError(422, "file_too_large", `Файл завеликий — максимум ${limitMb}MB.`);
    }
    if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.type)) {
      throw new ApiError(
        422,
        "unsupported_file_type",
        "Непідтримуваний тип файлу. Завантажте JPG, PNG або WebP.",
      );
    }

    const extension = PHOTO_EXTENSION_BY_MIME[file.type]!;
    const path = `${user.id}/${id}/${itemId}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const serviceClient = createServiceClient();
    const { error: uploadError } = await serviceClient.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });
    if (uploadError) {
      throw new ApiError(500, "storage_error", "Не вдалося завантажити фото.");
    }

    const {
      data: { publicUrl },
    } = serviceClient.storage.from(BUCKET).getPublicUrl(path);
    // Cache-bust: upsert keeps the same path/URL, so a re-upload needs a
    // new query string or browsers/CDNs keep serving the old cached photo.
    const photoUrl = `${publicUrl}?v=${Date.now()}`;

    await updateItemPhotoUrl(supabase, user.id, id, itemId, photoUrl);
    return apiSuccess({ photoUrl });
  },
  { rateLimitTier: "authenticated" },
);
