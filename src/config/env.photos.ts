import "server-only";
import { z } from "zod";

/**
 * Photo-search provider, own env file per the pattern in env.ai.ts (Stage
 * 4/5): each integration gets its own schema so importing one doesn't fail
 * on another integration's missing variables.
 *
 * PHOTO_PROVIDER mirrors AI_PROVIDER — the single switch provider-factory
 * reads, so adding a second provider (e.g. AI image generation, deferred
 * per the Stage 2 plan) means one more enum value here and one more `case`
 * in the photo provider factory, no call-site changes elsewhere.
 */
const photosEnvSchema = z.object({
  PHOTO_PROVIDER: z.enum(["pexels"]).default("pexels"),
  PEXELS_API_KEY: z
    .string({ message: "PEXELS_API_KEY є обов'язковою серверною змінною." })
    .min(1, "PEXELS_API_KEY не може бути порожньою."),
});

function loadPhotosEnv() {
  const parsed = photosEnvSchema.safeParse({
    PHOTO_PROVIDER: process.env.PHOTO_PROVIDER,
    PEXELS_API_KEY: process.env.PEXELS_API_KEY,
  });

  if (!parsed.success) {
    const details = z.prettifyError(parsed.error);
    throw new Error(
      `❌ Некоректні змінні середовища фото-провайдера.\n${details}\n\nПеревірте файл .env.local (див. .env.example).`,
    );
  }

  return parsed.data;
}

export const photosEnv = loadPhotosEnv();
