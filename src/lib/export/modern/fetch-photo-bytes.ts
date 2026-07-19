import "server-only";

import { logger } from "@/lib/logger";
import { dishPhotoUrlForEngine } from "@/lib/utils/dish-photo-url";
import type { MenuLayoutEngine } from "@/lib/utils/resolve-menu-style";
import type { MenuContent } from "@/services/ai/schemas/menu-content";

/** Only formats PDFKit can actually decode — an SVG or AVIF here crashes the PDF render outright. */
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
const FETCH_TIMEOUT_MS = 8000;

export type PhotoBytesByItemId = Map<string, string>;

/**
 * Downloads every dish photo a menu references and returns them as base64
 * data URIs keyed by item id.
 *
 * The PDF has to carry its own pixels: @react-pdf/renderer embeds image
 * bytes into the document, and a printed menu must not depend on a CDN
 * still serving a URL months later. The PNG renderer takes URLs directly
 * (Satori fetches them itself), so this is PDF-only.
 *
 * A photo that fails for any reason — network, timeout, 404, a content
 * type PDFKit can't decode — is simply absent from the map, and the
 * renderer draws its category-colored placeholder instead. One dead image
 * must never fail the whole export; that is the difference between a menu
 * with one grey square and no menu at all.
 *
 * `engine` picks the crop size requested from Pexels before the bytes are
 * fetched (see dishPhotoUrlForEngine) — the PDF embeds whatever bytes it
 * downloads at their native resolution, so getting the size right here,
 * not after the fact, is what keeps a Grid PDF's tile sharp without
 * bloating a Modern PDF's 48pt thumbnail with pixels it will never show.
 */
export async function fetchPhotoBytes(
  content: MenuContent,
  engine: MenuLayoutEngine,
): Promise<PhotoBytesByItemId> {
  const items = content.categories
    .flatMap((category) => category.items)
    .filter((item): item is typeof item & { photoUrl: string } => Boolean(item.photoUrl));

  const entries = await Promise.all(
    items.map(async (item) => {
      try {
        const response = await fetch(dishPhotoUrlForEngine(item.photoUrl, engine), {
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        if (!response.ok) {
          logger.warn({ itemId: item.id, status: response.status }, "pdf_photo_fetch_failed");
          return null;
        }
        const contentType = (response.headers.get("content-type") ?? "").split(";")[0]!.trim();
        if (!SUPPORTED_IMAGE_TYPES.has(contentType)) {
          logger.warn({ itemId: item.id, contentType }, "pdf_photo_unsupported_type");
          return null;
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        return [item.id, `data:${contentType};base64,${buffer.toString("base64")}`] as const;
      } catch (err) {
        logger.warn({ err, itemId: item.id }, "pdf_photo_fetch_error");
        return null;
      }
    }),
  );

  return new Map(entries.filter((e): e is NonNullable<typeof e> => e !== null));
}
