import "server-only";

import { createServiceClient } from "@/lib/supabase/service";

const BUCKET = "menu-uploads";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}

/** Uploads via the service client (not the user's session client) so this works regardless of RLS nuances — path itself still encodes the owning user for the defense-in-depth policies in migration 20260712090000. Returns the storage object path (not a public URL — the bucket is private). */
export async function uploadMenuFile(userId: string, menuId: string, file: File): Promise<string> {
  const supabase = createServiceClient();
  const path = `${userId}/${menuId}/${sanitizeFilename(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (error) {
    throw new Error(`Failed to upload menu file: ${error.message}`);
  }

  return path;
}

/** Best-effort cleanup when the import flow fails after a file was already uploaded — never throws, since a stray orphaned file is a minor cost, not worth failing the user-facing error response over. */
export async function deleteMenuFileSafe(path: string): Promise<void> {
  try {
    const supabase = createServiceClient();
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Deliberately swallowed — see doc comment above.
  }
}
