import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ALLOWED_AVATAR_MIME_TYPES, PROFILE_CONFIG } from "@/config/profile";
import { ApiError } from "@/lib/errors";
import { createServiceClient } from "@/lib/supabase/service";

const BUCKET = "avatars";
const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const POST = withApiHandler(
  async (request) => {
    const { user, supabase } = await requireAuth();

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw new ApiError(422, "file_required", "Файл обов'язковий.");
    }
    if (file.size === 0) {
      throw new ApiError(422, "empty_file", "Файл порожній.");
    }
    if (file.size > PROFILE_CONFIG.maxAvatarSizeBytes) {
      const limitMb = PROFILE_CONFIG.maxAvatarSizeBytes / (1024 * 1024);
      throw new ApiError(422, "file_too_large", `Файл завеликий — максимум ${limitMb}MB.`);
    }
    if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type)) {
      throw new ApiError(
        422,
        "unsupported_file_type",
        "Непідтримуваний тип файлу. Завантажте JPG, PNG або WebP.",
      );
    }

    // A fixed filename (not the original name) + upsert so a user only ever
    // has one avatar object, and re-uploading overwrites it in place rather
    // than accumulating orphaned files.
    const extension = EXTENSION_BY_MIME[file.type]!;
    const path = `${user.id}/avatar.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const serviceClient = createServiceClient();
    const { error: uploadError } = await serviceClient.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });
    if (uploadError) {
      throw new ApiError(500, "storage_error", "Не вдалося завантажити аватар.");
    }

    const {
      data: { publicUrl },
    } = serviceClient.storage.from(BUCKET).getPublicUrl(path);
    // Cache-bust: overwriting the same path keeps the same public URL, so
    // browsers/CDNs would otherwise keep serving the old cached image.
    const avatarUrl = `${publicUrl}?v=${Date.now()}`;

    const { data, error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id)
      .select()
      .single();
    if (error || !data) {
      throw new ApiError(500, "db_error", "Не вдалося зберегти посилання на аватар.");
    }

    return apiSuccess(data);
  },
  { rateLimitTier: "authenticated" },
);
