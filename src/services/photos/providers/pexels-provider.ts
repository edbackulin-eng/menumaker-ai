import "server-only";

import { photosEnv } from "@/config/env.photos";
import { PhotoProviderError } from "@/services/photos/errors";
import type { PhotoProvider, PhotoSearchResult } from "@/services/photos/types";

const SEARCH_URL = "https://api.pexels.com/v1/search";

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  photographer: string;
  photographer_url: string;
  src: {
    small: string;
    tiny: string;
  };
}

interface PexelsSearchResponse {
  photos: PexelsPhoto[];
}

/**
 * Pexels implementation of PhotoProvider (see Stage 2 plan for why Pexels
 * over Unsplash: commercial use allowed, no mandatory per-display
 * attribution, hotlink-friendly). Only requests `src.small`/`src.tiny` —
 * never `src.original` or the larger variants — both to keep bandwidth
 * down and because a dish-row photo never needs more than a few hundred
 * pixels.
 *
 * Attribution (`photographer`/`photographer_url`) is captured on every
 * result but is a hard requirement to surface ONLY in the photo-picker
 * dialog's "Photos provided by Pexels" line — never on the rendered menu,
 * PDF, PNG, or `/m/[slug]`. See docs note in the Stage 2 plan.
 */
export class PexelsProvider implements PhotoProvider {
  async search(query: string, count = 15): Promise<PhotoSearchResult[]> {
    const url = new URL(SEARCH_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", String(count));
    url.searchParams.set("orientation", "square");

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Authorization: photosEnv.PEXELS_API_KEY },
      });
    } catch {
      throw new PhotoProviderError("Не вдалося зв'язатися з Pexels.", "network");
    }

    if (response.status === 429) {
      throw new PhotoProviderError("Pexels: перевищено ліміт запитів.", "rate_limited");
    }
    if (!response.ok) {
      throw new PhotoProviderError(`Pexels повернув помилку ${response.status}.`, "provider_error");
    }

    const data = (await response.json()) as PexelsSearchResponse;
    return data.photos.map((photo) => ({
      photoUrl: photo.src.small,
      thumbUrl: photo.src.tiny,
      width: photo.width,
      height: photo.height,
      externalId: String(photo.id),
      attributionName: photo.photographer,
      attributionUrl: photo.photographer_url,
    }));
  }
}
