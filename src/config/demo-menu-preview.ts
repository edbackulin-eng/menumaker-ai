import type { MenuLayoutEngine } from "@/lib/utils/resolve-menu-style";
import type { MenuContent } from "@/services/ai/schemas/menu-content";

/**
 * Demo dish photos for the empty-state preview carousel.
 *
 * Local static assets under `/public/demo-menu`, deliberately not Pexels
 * URLs: the very first screen a new user sees must not depend on a third
 * party being reachable, on PEXELS_API_KEY being present, or on that key
 * being under its rate limit. See public/demo-menu/CREDITS.md.
 *
 * All four slides share these same three files, so the browser downloads
 * them once for the whole carousel instead of once per layout — which is
 * what keeps a four-layout preview as cheap as a one-layout preview.
 */
const PHOTO = {
  salmon: "/demo-menu/grilled-salmon.webp",
  pasta: "/demo-menu/truffle-pasta.webp",
  salad: "/demo-menu/burrata-salad.webp",
} as const;

/**
 * The sample menu every preview slide renders.
 *
 * English, generic and short on purpose: this shows a first-time visitor
 * what their *own* menu will look like, in any of the five interface
 * languages, without inventing per-locale sample dish names for what is a
 * decorative demo. Kept to one category of three dishes so the HTML cost of
 * rendering it four times over stays small.
 *
 * `venue` is filled in because three of the four engines lead with a banner
 * or masthead — an unnamed venue would show these layouts at their least
 * convincing, which is the opposite of this screen's job.
 */
export const DEMO_MENU_CONTENT: MenuContent = {
  currency: "$",
  venue: {
    name: "Olive & Ember",
    tagline: "Seasonal kitchen · since 2014",
    address: "12 Harbour Street",
    phone: "+1 555 0123",
  },
  categories: [
    {
      id: "demo-category",
      name: "Chef's specials",
      items: [
        {
          id: "demo-item-1",
          name: "Grilled salmon",
          price: 24,
          description: "Charred lemon, herb butter, seasonal greens",
          photoUrl: PHOTO.salmon,
          photoSource: "stock",
          badges: ["Chef's pick"],
        },
        {
          id: "demo-item-2",
          name: "Truffle pasta",
          price: 18,
          description: "Fresh tagliatelle, black truffle, aged parmesan",
          photoUrl: PHOTO.pasta,
          photoSource: "stock",
          badges: ["Vegetarian"],
        },
        {
          id: "demo-item-3",
          name: "Burrata salad",
          price: 14,
          description: "Heirloom beets, pistachio, aged balsamic",
          photoUrl: PHOTO.salad,
          photoSource: "stock",
          badges: ["Vegetarian"],
        },
      ],
    },
  ],
};

/**
 * Which template each carousel slide uses, in running order.
 *
 * Ordered to alternate light and dark and to put the photo-led layouts
 * first: Modern (dark, photo thumbnails) → Grid (light, photo tiles) →
 * Bistro (light, purely typographic) → Editorial (light, hero photos).
 *
 * Bistro renders no dish photos at all — that is its design, not a gap.
 * Including it is the point: a visitor who wants a plain printed menu sees
 * immediately that the product does that too.
 *
 * Matching is by `engine` with a preferred slug, not by slug alone: slugs
 * multiplied per business type in Stage 3, so a slug-only lookup silently
 * breaks whenever the preset set is reshuffled, whereas every engine is
 * guaranteed to have at least one template.
 */
export interface DemoSlideSpec {
  engine: MenuLayoutEngine;
  preferredSlug: string;
}

export const DEMO_PREVIEW_SLIDES: DemoSlideSpec[] = [
  { engine: "banner-two-column", preferredSlug: "modern" },
  { engine: "grid", preferredSlug: "grid-burger" },
  { engine: "classic-elegant", preferredSlug: "bistro-cream" },
  { engine: "editorial", preferredSlug: "editorial-gallery" },
];
