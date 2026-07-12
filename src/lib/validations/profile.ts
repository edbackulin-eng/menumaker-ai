import { z } from "zod";

import { CURATED_LOCALES, type LocaleId } from "@/config/profile";

const LOCALE_IDS = CURATED_LOCALES.map((locale) => locale.id) as [LocaleId, ...LocaleId[]];

export const updateProfileSchema = z
  .object({
    full_name: z.string().trim().min(1, "Ім'я не може бути порожнім.").max(200).optional(),
    locale: z.enum(LOCALE_IDS).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Потрібно вказати хоча б одне поле для оновлення.",
  });
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Password change reuses resetPasswordSchema (src/lib/validations/auth.ts)
// directly — identical shape/rules (password + confirmPassword), no reason
// to maintain a second copy that could drift.
export {
  resetPasswordSchema as changePasswordSchema,
  type ResetPasswordInput as ChangePasswordInput,
} from "@/lib/validations/auth";

/** Typed exactly like the double-confirmation the Danger Zone dialog requires — see ProfilePage. */
export const deleteAccountSchema = z.object({
  confirmEmail: z.string().trim().min(1, "Введіть email для підтвердження."),
});
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
