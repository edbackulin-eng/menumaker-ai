/* eslint-disable jsx-a11y/alt-text -- @react-pdf/renderer's <Image> draws
   into a PDF document. It is not an HTML element and has no alt concept;
   the rule matches on the component name only. */
import "server-only";
import { Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { resolveCurrencyDisplay } from "@/config/menu-currency";
import { MODERN_PALETTE } from "@/components/menu-render/modern/modern-palette";
import { distributeSequentially } from "@/lib/export/design-tokens";
import { getPdfFontPath } from "@/lib/export/fonts";
import type { PhotoBytesByItemId } from "@/lib/export/modern/fetch-photo-bytes";
import { getDishPlaceholderColor } from "@/lib/utils/dish-photo-placeholder";
import type { MenuCategory, MenuItem } from "@/services/ai/schemas/menu-content";
import type { ExportableMenu } from "@/services/export/load-menu";

const BODY_FONT_FAMILY = "ModernBodyFont";
const HEADING_FONT_FAMILY = "ModernHeadingFont";

const PAGE_WIDTH = 595.28;
const HORIZONTAL_PADDING = 26;
const COLUMN_GAP = 26;
const COLUMN_WIDTH = (PAGE_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

/**
 * @react-pdf/renderer tree for the `banner-two-column` engine.
 *
 * Two real columns here, unlike the classic PDF path which deliberately
 * collapses to one: Modern's identity *is* the two-column spread, and its
 * categories are short enough that the pagination risk the classic
 * renderer was avoiding (uneven parallel flows drifting apart across
 * pages) is bounded — each column is a single `wrap`-able flow and
 * `minPresenceAhead` keeps a heading from stranding at a page break.
 *
 * Column order comes from distributeSequentially, not the round-robin
 * distributeIntoColumns the classic exports use: the DOM renderer lays
 * Modern out with CSS multi-column, which fills newspaper-style, and this
 * template is specified as identical across Web/PDF/PNG.
 *
 * No gradients anywhere — react-pdf cannot render them, which is exactly
 * why MODERN_PALETTE is flat by design.
 */
export function registerModernPdfFonts(menu: ExportableMenu) {
  Font.register({ family: BODY_FONT_FAMILY, src: getPdfFontPath(menu.style.fontId) });
  Font.register({ family: HEADING_FONT_FAMILY, src: getPdfFontPath(menu.style.headingFontId) });
}

const styles = StyleSheet.create({
  page: { fontFamily: BODY_FONT_FAMILY, backgroundColor: MODERN_PALETTE.page },
  banner: {
    height: 132,
    backgroundColor: MODERN_PALETTE.banner,
    borderBottom: `1px solid ${MODERN_PALETTE.bannerBorder}`,
    justifyContent: "center",
    alignItems: "center",
  },
  tagline: {
    fontSize: 8,
    letterSpacing: 3,
    color: MODERN_PALETTE.gold,
    textTransform: "uppercase",
    marginBottom: 6,
    textAlign: "center",
  },
  venueName: {
    fontFamily: HEADING_FONT_FAMILY,
    fontSize: 30,
    color: MODERN_PALETTE.text,
    letterSpacing: 1,
    textAlign: "center",
  },
  bannerRule: { marginTop: 10, width: 52, height: 1, backgroundColor: MODERN_PALETTE.gold },
  columns: {
    flexDirection: "row",
    padding: `20 ${HORIZONTAL_PADDING} 16`,
    gap: COLUMN_GAP,
  },
  column: { width: COLUMN_WIDTH },
  categoryName: { fontFamily: HEADING_FONT_FAMILY, fontSize: 15, color: MODERN_PALETTE.text },
  categoryRule: { marginTop: 5, width: 28, height: 2, backgroundColor: MODERN_PALETTE.gold },
  row: { flexDirection: "row", gap: 9, marginBottom: 13 },
  photo: { width: 48, height: 48, borderRadius: 6 },
  rowBody: { flex: 1 },
  nameLine: { flexDirection: "row", justifyContent: "space-between", gap: 5 },
  dishName: { fontSize: 10, color: MODERN_PALETTE.text },
  price: { fontFamily: HEADING_FONT_FAMILY, fontSize: 11, color: MODERN_PALETTE.gold },
  description: { fontSize: 8, color: MODERN_PALETTE.textMuted, marginTop: 3, lineHeight: 1.4 },
  badge: {
    fontSize: 6.5,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  footer: {
    backgroundColor: MODERN_PALETTE.footer,
    borderTop: `1px solid ${MODERN_PALETTE.footerBorder}`,
    padding: `10 ${HORIZONTAL_PADDING}`,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerContact: { fontSize: 9, color: MODERN_PALETTE.footerText },
  footerQrLabel: { fontSize: 8, color: MODERN_PALETTE.footerText, textAlign: "right" },
  qr: { width: 38, height: 38, borderRadius: 4 },
});

const DIETARY = new Set(["vegetarian", "vegan", "gluten-free", "gluten free"]);

function ModernPdfRow({
  item,
  categoryName,
  currency,
  showBadges,
  photoDataUri,
}: {
  item: MenuItem;
  categoryName: string;
  currency: string | undefined;
  showBadges: boolean;
  photoDataUri: string | undefined;
}) {
  const badges = showBadges ? (item.badges ?? []) : [];
  return (
    <View style={styles.row} wrap={false}>
      {photoDataUri ? (
        <Image src={photoDataUri} style={styles.photo} />
      ) : (
        // A flat category-colored square, never an empty gap: a dish whose
        // photo didn't resolve must still look deliberate in print.
        <View style={[styles.photo, { backgroundColor: getDishPlaceholderColor(categoryName) }]} />
      )}
      <View style={styles.rowBody}>
        <View style={styles.nameLine}>
          <Text style={styles.dishName}>{item.name}</Text>
          {item.price !== undefined && (
            <Text style={styles.price}>
              {item.price}
              {currency ? ` ${currency}` : ""}
            </Text>
          )}
        </View>
        {item.description && <Text style={styles.description}>{item.description}</Text>}
        {badges.map((badge) => {
          const dietary = DIETARY.has(badge.trim().toLowerCase());
          return (
            <Text
              key={badge}
              style={[
                styles.badge,
                {
                  color: dietary ? MODERN_PALETTE.badgeVeg : MODERN_PALETTE.gold,
                  border: `0.5px solid ${dietary ? MODERN_PALETTE.badgeVegBorder : MODERN_PALETTE.badgeGoldBorder}`,
                },
              ]}
            >
              {badge}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

function ModernPdfCategory({
  category,
  currency,
  showBadges,
  photos,
}: {
  category: MenuCategory;
  currency: string | undefined;
  showBadges: boolean;
  photos: PhotoBytesByItemId;
}) {
  return (
    <View style={{ marginBottom: 18 }} minPresenceAhead={60}>
      <Text style={styles.categoryName}>{category.name}</Text>
      <View style={styles.categoryRule} />
      <View style={{ marginTop: 11 }}>
        {category.items.map((item) => (
          <ModernPdfRow
            key={item.id}
            item={item}
            categoryName={category.name}
            currency={currency}
            showBadges={showBadges}
            photoDataUri={photos.get(item.id)}
          />
        ))}
      </View>
    </View>
  );
}

export function ModernPdfPage({
  menu,
  photos,
  qrDataUri,
  qrLabel,
}: {
  menu: ExportableMenu;
  photos: PhotoBytesByItemId;
  qrDataUri: string | undefined;
  qrLabel: string;
}) {
  const venue = menu.content.venue;
  const currency = resolveCurrencyDisplay(menu.content.currency);
  const [left = [], right = []] = distributeSequentially(menu.content.categories, 2);
  const contactLine = [venue?.address, venue?.phone].filter(Boolean).join(" · ");
  const venueName = venue?.name ?? menu.title;

  return (
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.banner}>
        {venue?.tagline && <Text style={styles.tagline}>{venue.tagline}</Text>}
        <Text style={styles.venueName}>{venueName}</Text>
        <View style={styles.bannerRule} />
      </View>

      <View style={styles.columns}>
        {[left, right].map((group, index) => (
          <View key={index} style={styles.column}>
            {group.map((category) => (
              <ModernPdfCategory
                key={category.id}
                category={category}
                currency={currency}
                showBadges={menu.style.showBadges}
                photos={photos}
              />
            ))}
          </View>
        ))}
      </View>

      {(contactLine || qrDataUri) && (
        <View style={styles.footer} fixed>
          <Text style={styles.footerContact}>{contactLine}</Text>
          {qrDataUri && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={styles.footerQrLabel}>{qrLabel}</Text>
              <Image src={qrDataUri} style={styles.qr} />
            </View>
          )}
        </View>
      )}
    </Page>
  );
}
