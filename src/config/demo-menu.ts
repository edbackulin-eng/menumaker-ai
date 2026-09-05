import "server-only";

import type { MenuContent } from "@/services/ai/schemas/menu-content";

/**
 * Hardcoded sample menu rendered by the public `/m/[slug]` page when
 * `DEMO_MODE` is on — the portfolio build has no database, so this constant
 * stands in for what would otherwise be a Supabase row's `content`.
 *
 * Photos are the three local WebP files already shipped for the dashboard
 * carousel (`public/demo-menu/`, see CREDITS.md) — deliberately reused so the
 * demo pulls NOTHING from an external domain (no Pexels, no CDN). Dishes
 * without a matching local file are left photo-less on purpose; the renderer
 * shows a category-colored placeholder, never a broken image.
 *
 * An Italian trattoria: generic, universally legible, English throughout, and
 * priced in USD. Four categories so the layout engines have real structure to
 * show; a few badges to exercise the badge rendering path.
 */
const PHOTO = {
  salmon: "/demo-menu/grilled-salmon.webp",
  pasta: "/demo-menu/truffle-pasta.webp",
  salad: "/demo-menu/burrata-salad.webp",
} as const;

/** Fixed slug for the demo menu. In DEMO_MODE any `/m/*` path renders it. */
export const DEMO_MENU_SLUG = "demo";

/** Menu title (the `menus.title` column stand-in) — shown above photo-less engines. */
export const DEMO_MENU_TITLE = "Trattoria Bella";

/** Content locale — drives the menu footer language, mirroring a real row's `locale`. */
export const DEMO_MENU_LOCALE = "en";

export const DEMO_MENU_CONTENT: MenuContent = {
  currency: "$",
  venue: {
    name: "Trattoria Bella",
    tagline: "Italian kitchen · since 2011",
    address: "8 Riverside Walk",
    phone: "+1 555 0142",
  },
  categories: [
    {
      id: "demo-antipasti",
      name: "Antipasti",
      items: [
        {
          id: "demo-antipasti-1",
          name: "Burrata & heirloom tomatoes",
          price: 15,
          description: "Creamy burrata, basil oil, aged balsamic, toasted focaccia",
          photoUrl: PHOTO.salad,
          photoSource: "stock",
          badges: ["Vegetarian", "Chef's pick"],
        },
        {
          id: "demo-antipasti-2",
          name: "Bruschetta classica",
          price: 11,
          description: "Grilled sourdough, marinated tomatoes, garlic, extra virgin olive oil",
          badges: ["Vegetarian"],
        },
        {
          id: "demo-antipasti-3",
          name: "Prosciutto & melon",
          price: 14,
          description: "18-month cured prosciutto di Parma with sweet cantaloupe",
        },
        {
          id: "demo-antipasti-4",
          name: "Fritto misto",
          price: 16,
          description: "Lightly fried calamari and prawns, lemon, saffron aioli",
        },
      ],
    },
    {
      id: "demo-pasta",
      name: "Pasta",
      items: [
        {
          id: "demo-pasta-1",
          name: "Tagliatelle al tartufo",
          price: 22,
          description: "Fresh egg tagliatelle, black truffle, aged parmesan, butter",
          photoUrl: PHOTO.pasta,
          photoSource: "stock",
          badges: ["Signature"],
        },
        {
          id: "demo-pasta-2",
          name: "Spaghetti alle vongole",
          price: 20,
          description: "Clams, white wine, chili, parsley, garlic",
        },
        {
          id: "demo-pasta-3",
          name: "Rigatoni all'amatriciana",
          price: 18,
          description: "Guanciale, San Marzano tomatoes, pecorino romano",
        },
        {
          id: "demo-pasta-4",
          name: "Gnocchi al pesto",
          price: 17,
          description: "Hand-rolled potato gnocchi, Genovese basil pesto, pine nuts",
          badges: ["Vegetarian"],
        },
      ],
    },
    {
      id: "demo-mains",
      name: "Secondi",
      items: [
        {
          id: "demo-mains-1",
          name: "Grilled salmon",
          price: 26,
          description: "Charred lemon, herb butter, seasonal greens",
          photoUrl: PHOTO.salmon,
          photoSource: "stock",
          badges: ["Chef's pick"],
        },
        {
          id: "demo-mains-2",
          name: "Pollo alla milanese",
          price: 23,
          description: "Breaded chicken breast, rocket, cherry tomatoes, lemon",
        },
        {
          id: "demo-mains-3",
          name: "Osso buco",
          price: 29,
          description: "Slow-braised veal shank, saffron risotto, gremolata",
          badges: ["Signature"],
        },
      ],
    },
    {
      id: "demo-dolci",
      name: "Dolci",
      items: [
        {
          id: "demo-dolci-1",
          name: "Tiramisù",
          price: 10,
          description: "Espresso-soaked savoiardi, mascarpone cream, cocoa",
          badges: ["Vegetarian"],
        },
        {
          id: "demo-dolci-2",
          name: "Panna cotta",
          price: 9,
          description: "Vanilla bean cream, wild berry compote",
          badges: ["Vegetarian"],
        },
        {
          id: "demo-dolci-3",
          name: "Affogato",
          price: 8,
          description: "Vanilla gelato drowned in a shot of hot espresso",
          badges: ["Vegetarian"],
        },
      ],
    },
  ],
};
