import { z } from "zod";

/** Params for all photo endpoints — item ids are crypto.randomUUID() (see assignContentIds), same shape as menuIdParamSchema. */
export const menuItemParamsSchema = z.object({
  id: z.string().uuid("Некоректний ідентифікатор меню."),
  itemId: z.string().uuid("Некоректний ідентифікатор страви."),
});

/**
 * Body for POST .../photo/select — the user picking one of the candidates
 * the search endpoint returned. `url()` is the only real constraint: we
 * don't pin the domain to images.pexels.com because that would break the
 * moment Pexels changes CDN hosts, and there's no injection risk from
 * storing an arbitrary URL string that only ever ends up as an `<img src>`.
 */
export const selectItemPhotoSchema = z.object({
  photoUrl: z.string().trim().url("Некоректний URL фото."),
});
