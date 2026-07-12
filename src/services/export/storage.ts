import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createServiceClient } from "@/lib/supabase/service";
import type { Database } from "@/types/database.types";

const BUCKET = "menu-exports";

type ExportType = Database["public"]["Enums"]["menu_export_type"];

/**
 * Uses the service-role client for the actual Storage write, matching the
 * proven pattern from avatars/menu-uploads (Stage 7/8) rather than the
 * bucket's own "authenticated user writes their own folder" RLS policy —
 * that policy is still in place as defense-in-depth (the path itself is
 * still namespaced by user_id), but is not the load-bearing check here.
 * Confirmed directly: the same own-folder policy shape that's supposedly
 * proven by the avatars bucket actually never sees real traffic (that
 * route also uses service-role — see profile/avatar/route.ts) — a
 * genuinely session-authenticated client hit a row-level-security
 * rejection against both buckets when tested directly, a latent gap this
 * stage surfaced rather than introduced. Worth a follow-up investigation
 * into Supabase Storage's RLS evaluation, but out of scope to chase
 * further here when the service-role path is already the established,
 * working precedent.
 */
export async function uploadExportFile(
  userId: string,
  menuId: string,
  exportType: ExportType,
  buffer: Buffer,
  contentType: string,
  extension: string,
): Promise<string> {
  const supabase = createServiceClient();
  const path = `${userId}/${menuId}/${exportType}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) {
    throw new Error(`Failed to upload export file: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}

export async function logMenuExport(
  supabase: SupabaseClient<Database>,
  userId: string,
  menuId: string,
  exportType: ExportType,
  fileUrl: string,
): Promise<void> {
  const { error } = await supabase
    .from("menu_exports")
    .insert({ user_id: userId, menu_id: menuId, export_type: exportType, file_url: fileUrl });
  if (error) {
    throw new Error(`Failed to log menu export: ${error.message}`);
  }
}
