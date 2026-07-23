import { isCurrencyId } from "@/config/menu-currency";
import type { MenuContent } from "@/services/ai/schemas/menu-content";

/**
 * Schema.org `Restaurant` + `Menu` for a public menu page
 * (https://schema.org/Restaurant, https://schema.org/Menu).
 *
 * Built straight from the same `MenuContent` every renderer already reads
 * — no separate data model to keep in sync. Every optional field is
 * omitted rather than filled with a guess: `venue.address` is one free-text
 * line (Stage 3's own decision — see menu-content.ts), not a structured
 * address, so it becomes `PostalAddress.streetAddress` verbatim rather
 * than being parsed into street/city/postcode, which would mean inventing
 * a split that isn't in the data.
 *
 * `priceCurrency` is included only when `content.currency` is one of the
 * curated IDs (`isCurrencyId`) — every one of those IDs is already a real
 * ISO 4217 code (USD, EUR, UAH, ...), so no separate symbol→code mapping
 * is needed. A legacy free-text currency value (pre-dates the curated
 * list) is left out rather than guessed at; Google's Rich Results will
 * flag the missing field on just those items instead of the whole page
 * carrying a fabricated currency.
 */
export function buildMenuJsonLd({
  content,
  venueName,
  url,
}: {
  content: MenuContent;
  venueName: string;
  url: string;
}) {
  const priceCurrency =
    content.currency && isCurrencyId(content.currency) ? content.currency : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: venueName,
    url,
    ...(content.venue?.address
      ? { address: { "@type": "PostalAddress", streetAddress: content.venue.address } }
      : {}),
    ...(content.venue?.phone ? { telephone: content.venue.phone } : {}),
    hasMenu: {
      "@type": "Menu",
      hasMenuSection: content.categories.map((category) => ({
        "@type": "MenuSection",
        name: category.name,
        hasMenuItem: category.items.map((item) => ({
          "@type": "MenuItem",
          name: item.name,
          ...(item.description ? { description: item.description } : {}),
          ...(item.price !== undefined
            ? {
                offers: {
                  "@type": "Offer",
                  price: item.price,
                  ...(priceCurrency ? { priceCurrency } : {}),
                },
              }
            : {}),
        })),
      })),
    },
  };
}
