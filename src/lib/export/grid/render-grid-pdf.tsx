/* eslint-disable jsx-a11y/alt-text -- @react-pdf/renderer's <Image> draws
   into a PDF document. It is not an HTML element and has no alt concept;
   the rule matches on the component name only. */
import "server-only";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import { isDietaryBadge } from "@/components/menu-render/grid/grid-dish-card";
import { parseGridPalette, type GridPalette } from "@/components/menu-render/grid/grid-palette";
import { publicEnv } from "@/config/env";
import { resolveCurrencyDisplay } from "@/config/menu-currency";
import { getPdfFontPath } from "@/lib/export/fonts";
import { chunkIntoRows, GRID_EXPORT_COLUMNS } from "@/lib/export/grid/grid-rows";
import { fetchPhotoBytes, type PhotoBytesByItemId } from "@/lib/export/modern/fetch-photo-bytes";
import { generateQrPng } from "@/lib/export/qr";
import { getDishPlaceholderColor } from "@/lib/utils/dish-photo-placeholder";
import type { MenuCategory, MenuItem } from "@/services/ai/schemas/menu-content";
import type { ExportableMenu } from "@/services/export/load-menu";

const BODY_FONT_FAMILY = "GridBodyFont";
const HEADING_FONT_FAMILY = "GridHeadingFont";

const PAGE_WIDTH = 595.28;
const HORIZONTAL_PADDING = 28;
const GUTTER = 10;
const CARD_WIDTH =
  (PAGE_WIDTH - HORIZONTAL_PADDING * 2 - GUTTER * (GRID_EXPORT_COLUMNS - 1)) / GRID_EXPORT_COLUMNS;
/** 4:3, the same ratio the DOM card and the PNG both use. */
const PHOTO_HEIGHT = Math.round((CARD_WIDTH * 3) / 4);

/** The QR caption. Not routed through next-intl: this renderer runs outside a request's locale context, and the string belongs to the menu's own content language. */
const GRID_PDF_QR_LABEL = "Scan for full menu";

async function buildQrDataUri(menu: ExportableMenu): Promise<string | undefined> {
  if (!menu.publicSlug || !menu.isPublic) return undefined;
  const png = await generateQrPng(`${publicEnv.NEXT_PUBLIC_APP_URL}/m/${menu.publicSlug}`);
  return `data:image/png;base64,${png.toString("base64")}`;
}

function buildStyles(palette: GridPalette) {
  return StyleSheet.create({
    page: { fontFamily: BODY_FONT_FAMILY, backgroundColor: palette.page },
    header: { padding: "26 28 6", alignItems: "center" },
    tagline: {
      fontSize: 7.5,
      letterSpacing: 2.5,
      textTransform: "uppercase",
      color: palette.accent,
      marginBottom: 5,
    },
    venueName: { fontFamily: HEADING_FONT_FAMILY, fontSize: 24, color: palette.text },
    body: { padding: `12 ${HORIZONTAL_PADDING} 10` },
    categoryName: { fontFamily: HEADING_FONT_FAMILY, fontSize: 14, color: palette.text },
    categoryRule: { marginTop: 4, width: 26, height: 2, backgroundColor: palette.accent },
    row: { flexDirection: "row", gap: GUTTER, marginBottom: GUTTER },
    card: {
      width: CARD_WIDTH,
      backgroundColor: palette.card,
      border: `1px solid ${palette.cardBorder}`,
      borderRadius: 6,
    },
    photo: {
      width: CARD_WIDTH,
      height: PHOTO_HEIGHT,
      objectFit: "cover",
      borderTopLeftRadius: 6,
      borderTopRightRadius: 6,
    },
    cardBody: { padding: "6 7 8" },
    nameLine: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
    dishName: { fontSize: 8, color: palette.text },
    price: { fontFamily: HEADING_FONT_FAMILY, fontSize: 8, color: palette.accent },
    description: { fontSize: 6.5, color: palette.textMuted, marginTop: 2, lineHeight: 1.35 },
    badge: {
      fontSize: 5.5,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      paddingVertical: 1.5,
      paddingHorizontal: 4,
      borderRadius: 2,
      marginTop: 3,
      alignSelf: "flex-start",
    },
    footer: {
      backgroundColor: palette.footer,
      borderTop: `1px solid ${palette.footerBorder}`,
      padding: `10 ${HORIZONTAL_PADDING}`,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerContact: { fontSize: 8.5, color: palette.footerText },
    footerQrLabel: { fontSize: 7.5, color: palette.footerText, textAlign: "right" },
    qr: { width: 34, height: 34, borderRadius: 3 },
  });
}

type GridStyles = ReturnType<typeof buildStyles>;

function GridPdfCard({
  item,
  categoryName,
  currency,
  showBadges,
  hidePhotos,
  photoDataUri,
  palette,
  styles,
}: {
  item: MenuItem;
  categoryName: string;
  currency: string | undefined;
  showBadges: boolean;
  hidePhotos: boolean;
  photoDataUri: string | undefined;
  palette: GridPalette;
  styles: GridStyles;
}) {
  const badges = showBadges ? (item.badges ?? []) : [];
  return (
    <View style={styles.card}>
      {!hidePhotos &&
        (photoDataUri ? (
          <Image src={photoDataUri} style={styles.photo} />
        ) : (
          // Same fixed box as a real photo, filled with the dish's
          // category color. In this engine the photo *is* the tile, so an
          // empty gap here would leave a visibly broken hole in the grid.
          <View
            style={[styles.photo, { backgroundColor: getDishPlaceholderColor(categoryName) }]}
          />
        ))}
      <View style={styles.cardBody}>
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
          const dietary = isDietaryBadge(badge);
          return (
            <Text
              key={badge}
              style={[
                styles.badge,
                {
                  color: dietary ? palette.badgeVeg : palette.accent,
                  border: `0.5px solid ${dietary ? palette.badgeVegBorder : palette.accentBorder}`,
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

function GridPdfCategory({
  category,
  currency,
  showBadges,
  hidePhotos,
  photos,
  palette,
  styles,
}: {
  category: MenuCategory;
  currency: string | undefined;
  showBadges: boolean;
  hidePhotos: boolean;
  photos: PhotoBytesByItemId;
  palette: GridPalette;
  styles: GridStyles;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      {/* minPresenceAhead keeps a heading from stranding alone at the foot
          of a page — it must be followed by at least one tile row. Without
          photos a row is only its text card, so requiring a photo's worth
          of space would push headings onto the next page for no reason. */}
      <View minPresenceAhead={(hidePhotos ? 0 : PHOTO_HEIGHT) + 30}>
        <Text style={styles.categoryName}>{category.name}</Text>
        <View style={styles.categoryRule} />
      </View>
      <View style={{ marginTop: 9 }}>
        {chunkIntoRows(category.items).map((row, rowIndex) => (
          // wrap={false} per row, not per card: a row split across a page
          // boundary would put two tiles on one page and the third on the
          // next, at different vertical offsets — visibly broken in a way
          // a whole row moving down is not.
          <View key={rowIndex} style={styles.row} wrap={false}>
            {row.map((item) => (
              <GridPdfCard
                key={item.id}
                item={item}
                categoryName={category.name}
                currency={currency}
                showBadges={showBadges}
                hidePhotos={hidePhotos}
                photoDataUri={photos.get(item.id)}
                palette={palette}
                styles={styles}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * @react-pdf/renderer tree for the `grid` engine.
 *
 * Rows are built explicitly by chunkIntoRows rather than relying on
 * `flexWrap`, for two reasons: react-pdf paginates by measuring vertical
 * flow, and a wrapped flex container's break behaviour across a page
 * boundary is not something it guarantees; and explicit rows are what let
 * each row carry `wrap={false}` so a page break always falls *between*
 * rows. It also matches the PNG renderer exactly, which matters because
 * this engine is specified as identical across all three surfaces.
 */
export async function renderGridPdf(menu: ExportableMenu): Promise<Buffer> {
  Font.register({ family: BODY_FONT_FAMILY, src: getPdfFontPath(menu.style.fontId) });
  Font.register({ family: HEADING_FONT_FAMILY, src: getPdfFontPath(menu.style.headingFontId) });

  const palette = parseGridPalette(menu.style.palette);
  const styles = buildStyles(palette);
  const currency = resolveCurrencyDisplay(menu.content.currency);
  const venue = menu.content.venue;
  const contactLine = [venue?.address, venue?.phone].filter(Boolean).join(" · ");

  const hidePhotos = menu.content.hidePhotos ?? false;
  // Skip the downloads entirely rather than fetching bytes nothing renders.
  const [photos, qrDataUri] = await Promise.all([
    hidePhotos
      ? Promise.resolve<PhotoBytesByItemId>(new Map())
      : fetchPhotoBytes(menu.content, "grid"),
    buildQrDataUri(menu),
  ]);

  return renderToBuffer(
    <Document title={menu.title}>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          {venue?.tagline && <Text style={styles.tagline}>{venue.tagline}</Text>}
          <Text style={styles.venueName}>{venue?.name ?? menu.title}</Text>
        </View>

        <View style={styles.body}>
          {menu.content.categories.map((category) => (
            <GridPdfCategory
              key={category.id}
              category={category}
              currency={currency}
              showBadges={menu.style.showBadges}
              hidePhotos={hidePhotos}
              photos={photos}
              palette={palette}
              styles={styles}
            />
          ))}
        </View>

        {(contactLine || qrDataUri) && (
          <View style={styles.footer} fixed>
            <Text style={styles.footerContact}>{contactLine}</Text>
            {qrDataUri && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                <Text style={styles.footerQrLabel}>{GRID_PDF_QR_LABEL}</Text>
                <Image src={qrDataUri} style={styles.qr} />
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>,
  );
}
