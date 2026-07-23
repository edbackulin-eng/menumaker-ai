import type { MenuItem } from "@/services/ai/schemas/menu-content";

/**
 * The storage bucket every owner-uploaded dish photo lands in (see the
 * upload route). Any `photoUrl` pointing here is the owner's own file.
 */
const UPLOAD_BUCKET_MARKER = "/menu-photos/";

/**
 * True when a dish's photo is a replaceable stock (provider) result, false
 * when it is the owner's own upload — the single rule the "re-pick photos"
 * action uses to decide what it may overwrite.
 *
 * Reads `photoSource` when present. When it is absent — every menu created
 * before that field existed — the URL decides, and the tie is deliberately
 * broken *toward* "upload": a URL under our own `menu-photos` bucket is
 * treated as the owner's work and left alone. Getting this backwards would
 * destroy a photo the owner uploaded, so the fallback errs on the side of
 * not touching it rather than on the side of refreshing more.
 *
 * An item with no photo at all is "stock" in the sense that the refresh may
 * fill it in — there is nothing to lose.
 */
export function isStockPhoto(item: Pick<MenuItem, "photoUrl" | "photoSource">): boolean {
  if (item.photoSource === "upload") return false;
  if (item.photoSource === "stock") return true;
  if (!item.photoUrl) return true;
  return !item.photoUrl.includes(UPLOAD_BUCKET_MARKER);
}

/** Counts for the confirm dialog: how many photos a refresh would replace, and how many owner uploads it would leave alone. */
export function countRefreshableItems(categories: { items: MenuItem[] }[]): {
  replaceable: number;
  ownUploads: number;
} {
  let replaceable = 0;
  let ownUploads = 0;
  for (const category of categories) {
    for (const item of category.items) {
      if (isStockPhoto(item)) replaceable += 1;
      else ownUploads += 1;
    }
  }
  return { replaceable, ownUploads };
}
