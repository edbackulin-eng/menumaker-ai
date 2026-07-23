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

import {
  categoryHeroPhotoUrl,
  parseEditorialPalette,
  type EditorialPalette,
} from "@/components/menu-render/editorial/editorial-palette";
import { publicEnv } from "@/config/env";
import { resolveCurrencyDisplay } from "@/config/menu-currency";
import { getPdfFontPath } from "@/lib/export/fonts";
import { fetchPhotoBytes } from "@/lib/export/modern/fetch-photo-bytes";
import { generateQrPng } from "@/lib/export/qr";
import type { MenuCategory, MenuContent } from "@/services/ai/schemas/menu-content";
import type { ExportableMenu } from "@/services/export/load-menu";

const BODY_FONT_FAMILY = "EditorialBodyFont";
const HEADING_FONT_FAMILY = "EditorialHeadingFont";

const HORIZONTAL_PADDING = 36;
const HERO_HEIGHT = 190;

/** The QR caption. Not routed through next-intl — this renderer runs outside a request's locale context and the string belongs to the menu's own content language. */
const EDITORIAL_PDF_QR_LABEL = "Scan for full menu";

async function buildQrDataUri(menu: ExportableMenu): Promise<string | undefined> {
  if (!menu.publicSlug || !menu.isPublic) return undefined;
  const png = await generateQrPng(`${publicEnv.NEXT_PUBLIC_APP_URL}/m/${menu.publicSlug}`);
  return `data:image/png;base64,${png.toString("base64")}`;
}

/**
 * The hero item per category — the first dish that has a photo — as a
 * synthetic single-category content, so the shared (robust, tested)
 * fetchPhotoBytes downloads *only* the heroes it will actually embed, not
 * every photo in the menu. Editorial shows one photo per section, so
 * fetching all of them would waste the large `editorial` crop on images it
 * never draws.
 */
function heroBytesContent(content: MenuContent): MenuContent {
  const heroItems = content.categories
    .map((category) => category.items.find((item) => item.photoUrl))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);
  return { categories: [{ id: "heroes", name: "", items: heroItems }] };
}

function buildStyles(palette: EditorialPalette) {
  return StyleSheet.create({
    page: {
      fontFamily: BODY_FONT_FAMILY,
      backgroundColor: palette.page,
      padding: `32 ${HORIZONTAL_PADDING} 24`,
    },
    tagline: {
      fontSize: 8,
      letterSpacing: 3,
      textTransform: "uppercase",
      color: palette.accent,
      marginBottom: 8,
    },
    venueName: {
      fontFamily: HEADING_FONT_FAMILY,
      fontSize: 34,
      color: palette.text,
    },
    mastheadRule: { marginTop: 14, marginBottom: 26, height: 1, backgroundColor: palette.rule },
    category: { marginBottom: 22 },
    hero: { width: "100%", height: HERO_HEIGHT, objectFit: "cover" },
    heroPlaceholder: {
      width: "100%",
      height: HERO_HEIGHT,
      backgroundColor: palette.heroPlaceholder,
    },
    categoryName: {
      fontFamily: HEADING_FONT_FAMILY,
      fontSize: 20,
      color: palette.text,
      marginTop: 12,
    },
    categoryRule: {
      marginTop: 5,
      marginBottom: 4,
      width: 34,
      height: 2,
      backgroundColor: palette.accent,
    },
    row: { flexDirection: "row", gap: 14, paddingVertical: 8 },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: palette.rule,
      borderBottomStyle: "solid",
    },
    rowBody: { flex: 1 },
    dishName: { fontFamily: HEADING_FONT_FAMILY, fontSize: 12, color: palette.text },
    description: { fontSize: 9, color: palette.textMuted, marginTop: 3, lineHeight: 1.45 },
    price: { fontFamily: HEADING_FONT_FAMILY, fontSize: 11, color: palette.accent },
    footer: {
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: palette.footerRule,
      borderTopStyle: "solid",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerContact: { fontSize: 8.5, letterSpacing: 0.5, color: palette.footerText },
    footerQrRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    footerQrLabel: { fontSize: 7, color: palette.footerText },
    qr: { width: 30, height: 30, borderRadius: 3 },
  });
}

type EditorialStyles = ReturnType<typeof buildStyles>;

function EditorialPdfCategory({
  category,
  currency,
  hidePhotos,
  heroDataUri,
  styles,
}: {
  category: MenuCategory;
  currency: string | undefined;
  hidePhotos: boolean;
  heroDataUri: string | undefined;
  styles: EditorialStyles;
}) {
  return (
    <View style={styles.category} wrap>
      {/* The hero band + heading must not split from the first dish. With
          no hero there is no band to keep together, so the reservation
          drops to the heading alone. */}
      <View minPresenceAhead={(hidePhotos ? 0 : HERO_HEIGHT) + 60}>
        {!hidePhotos &&
          (heroDataUri ? (
            <Image src={heroDataUri} style={styles.hero} />
          ) : (
            <View style={styles.heroPlaceholder} />
          ))}
        <Text style={hidePhotos ? [styles.categoryName, { marginTop: 0 }] : styles.categoryName}>
          {category.name}
        </Text>
        <View style={styles.categoryRule} />
      </View>
      {category.items.map((item, index) => (
        <View
          key={item.id}
          style={[styles.row, index === category.items.length - 1 ? {} : styles.rowBorder]}
          wrap={false}
        >
          <View style={styles.rowBody}>
            <Text style={styles.dishName}>{item.name}</Text>
            {item.description && <Text style={styles.description}>{item.description}</Text>}
          </View>
          {item.price !== undefined && (
            <Text style={styles.price}>
              {item.price}
              {currency ? ` ${currency}` : ""}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

/**
 * @react-pdf/renderer tree for the `editorial` engine — single column, a
 * full-width hero photo per category. Only the hero photos are fetched as
 * bytes (see heroBytesContent), since those are the only images this engine
 * draws.
 *
 * No column distribution: a single reading column paginates top-to-bottom,
 * matching the DOM and PNG trees exactly.
 */
export async function renderEditorialPdf(menu: ExportableMenu): Promise<Buffer> {
  Font.register({ family: BODY_FONT_FAMILY, src: getPdfFontPath(menu.style.fontId) });
  Font.register({ family: HEADING_FONT_FAMILY, src: getPdfFontPath(menu.style.headingFontId) });

  const palette = parseEditorialPalette(menu.style.palette);
  const styles = buildStyles(palette);
  const currency = resolveCurrencyDisplay(menu.content.currency);
  const venue = menu.content.venue;
  const heading = venue?.name ?? menu.title;
  const contactLine = [venue?.address, venue?.phone].filter(Boolean).join(" · ");

  const hidePhotos = menu.content.hidePhotos ?? false;
  const [heroPhotos, qrDataUri] = await Promise.all([
    hidePhotos
      ? Promise.resolve(new Map<string, string>())
      : fetchPhotoBytes(heroBytesContent(menu.content), "editorial"),
    buildQrDataUri(menu),
  ]);

  // Map each category to its hero's data URI (by the hero item's id), so a
  // hero that failed to download simply falls back to the placeholder band.
  const heroByCategory = (category: MenuCategory): string | undefined => {
    const heroUrl = categoryHeroPhotoUrl(category.items);
    if (!heroUrl) return undefined;
    const heroItem = category.items.find((item) => item.photoUrl === heroUrl);
    return heroItem ? heroPhotos.get(heroItem.id) : undefined;
  };

  return renderToBuffer(
    <Document title={menu.title}>
      <Page size="A4" style={styles.page} wrap>
        <View>
          {venue?.tagline && <Text style={styles.tagline}>{venue.tagline}</Text>}
          <Text style={styles.venueName}>{heading}</Text>
          <View style={styles.mastheadRule} />
        </View>

        {menu.content.categories.map((category) => (
          <EditorialPdfCategory
            key={category.id}
            category={category}
            currency={currency}
            hidePhotos={hidePhotos}
            heroDataUri={heroByCategory(category)}
            styles={styles}
          />
        ))}

        {(contactLine || qrDataUri) && (
          <View style={styles.footer} fixed>
            <Text style={styles.footerContact}>{contactLine}</Text>
            {qrDataUri && (
              <View style={styles.footerQrRow}>
                <Text style={styles.footerQrLabel}>{EDITORIAL_PDF_QR_LABEL}</Text>
                <Image src={qrDataUri} style={styles.qr} />
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>,
  );
}
