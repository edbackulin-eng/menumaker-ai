import "server-only";

import { photosEnv } from "@/config/env.photos";
import { PexelsProvider } from "@/services/photos/providers/pexels-provider";
import type { PhotoProvider } from "@/services/photos/types";

let instance: PhotoProvider | undefined;

/**
 * Single point that maps PHOTO_PROVIDER -> concrete PhotoProvider, mirroring
 * src/services/ai/provider-factory.ts. Adding a second provider (e.g. AI
 * image generation) means adding one more `case` here.
 */
export function getPhotoProvider(): PhotoProvider {
  if (!instance) {
    switch (photosEnv.PHOTO_PROVIDER) {
      case "pexels":
        instance = new PexelsProvider();
        break;
      default:
        throw new Error(`Невідомий PHOTO_PROVIDER: ${String(photosEnv.PHOTO_PROVIDER)}`);
    }
  }
  return instance;
}
