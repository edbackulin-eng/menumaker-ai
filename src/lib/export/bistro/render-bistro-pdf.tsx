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
  parseBistroPalette,
  type BistroPalette,
} from "@/components/menu-render/bistro/bistro-palette";
import { publicEnv } from "@/config/env";
import { resolveCurrencyDisplay } from "@/config/menu-currency";
import { distributeSequentially } from "@/lib/export/design-tokens";
import { getPdfFontPath } from "@/lib/export/fonts";
import { generateQrPng } from "@/lib/export/qr";
import type { MenuCategory } from "@/services/ai/schemas/menu-content";
import type { ExportableMenu } from "@/services/export/load-menu";

const BODY_FONT_FAMILY = "BistroBodyFont";
const HEADING_FONT_FAMILY = "BistroHeadingFont";

const HORIZONTAL_PADDING = 40;
const COLUMN_GAP = 30;
const COLUMN_COUNT = 2;

/** The QR caption. Not routed through next-intl — this renderer runs outside a request's locale context and the string belongs to the menu's own content language. */
const BISTRO_PDF_QR_LABEL = "Scan for full menu";

async function buildQrDataUri(menu: ExportableMenu): Promise<string | undefined> {
  if (!menu.publicSlug || !menu.isPublic) return undefined;
  const png = await generateQrPng(`${publicEnv.NEXT_PUBLIC_APP_URL}/m/${menu.publicSlug}`);
  return `data:image/png;base64,${png.toString("base64")}`;
}

function buildStyles(palette: BistroPalette) {
  return StyleSheet.create({
    page: {
      fontFamily: BODY_FONT_FAMILY,
      backgroundColor: palette.page,
      padding: `28 ${HORIZONTAL_PADDING} 22`,
    },
    header: {
      alignItems: "center",
      borderTop: `1px solid ${palette.rule}`,
      borderBottom: `1px solid ${palette.rule}`,
      paddingVertical: 14,
      marginBottom: 20,
    },
    tagline: {
      fontSize: 8,
      letterSpacing: 3,
      textTransform: "uppercase",
      color: palette.accent,
      marginBottom: 6,
    },
    venueName: {
      fontFamily: HEADING_FONT_FAMILY,
      fontSize: 26,
      color: palette.text,
      letterSpacing: 1,
    },
    columns: { flexDirection: "row", gap: COLUMN_GAP },
    column: { flex: 1 },
    category: { marginBottom: 16 },
    categoryName: {
      fontFamily: HEADING_FONT_FAMILY,
      fontSize: 13,
      color: palette.text,
      textAlign: "center",
      letterSpacing: 0.5,
    },
    categoryRule: {
      alignSelf: "center",
      width: 22,
      height: 1,
      backgroundColor: palette.accent,
      marginTop: 4,
      marginBottom: 10,
    },
    row: { marginBottom: 8 },
    nameLine: { flexDirection: "row", alignItems: "flex-end", gap: 5 },
    dishName: { fontSize: 10, color: palette.text },
    leader: {
      flexGrow: 1,
      height: 7,
      borderBottomWidth: 1,
      borderBottomColor: palette.accent,
      // Dashed to match the Satori PNG (which can't draw dotted) — the
      // engine is specified identical across all three surfaces.
      borderBottomStyle: "dashed",
    },
    price: { fontFamily: HEADING_FONT_FAMILY, fontSize: 10, color: palette.accent },
    description: {
      // No italic: only a regular font face is registered, and react-pdf
      // hard-fails on an unresolved fontStyle. Muted color sets it apart.
      fontSize: 8,
      color: palette.textMuted,
      marginTop: 2,
      lineHeight: 1.35,
    },
    footer: {
      marginTop: 14,
      paddingTop: 10,
      borderTop: `1px solid ${palette.footerRule}`,
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
    },
    footerContact: { fontSize: 8.5, letterSpacing: 0.5, color: palette.footerText },
    footerQrRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    qr: { width: 30, height: 30, borderRadius: 3 },
    footerQrLabel: { fontSize: 7, letterSpacing: 0.5, color: palette.footerText },
  });
}

type BistroStyles = ReturnType<typeof buildStyles>;

function BistroPdfCategory({
  category,
  currency,
  styles,
}: {
  category: MenuCategory;
  currency: string | undefined;
  styles: BistroStyles;
}) {
  return (
    <View style={styles.category} wrap={false} minPresenceAhead={40}>
      <Text style={styles.categoryName}>{category.name}</Text>
      <View style={styles.categoryRule} />
      {category.items.map((item) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.nameLine}>
            <Text style={styles.dishName}>{item.name}</Text>
            <View style={styles.leader} />
            {item.price !== undefined && (
              <Text style={styles.price}>
                {item.price}
                {currency ? ` ${currency}` : ""}
              </Text>
            )}
          </View>
          {item.description && <Text style={styles.description}>{item.description}</Text>}
        </View>
      ))}
    </View>
  );
}

/**
 * @react-pdf/renderer tree for the `classic-elegant` (Bistro) engine.
 *
 * No <Image> for dishes and no fetchPhotoBytes call — this engine has no
 * dish photos to embed, which is also why it is the cheapest of the four to
 * export. The only raster is the optional footer QR.
 *
 * Columns come from distributeSequentially (newspaper fill), matching the
 * DOM's CSS multi-column and the PNG's explicit split, so all three agree
 * on dish order. Each category is `wrap={false}` so it never splits across
 * a page break mid-list; `minPresenceAhead` keeps a heading from stranding
 * at a page foot.
 */
export async function renderBistroPdf(menu: ExportableMenu): Promise<Buffer> {
  Font.register({ family: BODY_FONT_FAMILY, src: getPdfFontPath(menu.style.fontId) });
  Font.register({ family: HEADING_FONT_FAMILY, src: getPdfFontPath(menu.style.headingFontId) });

  const palette = parseBistroPalette(menu.style.palette);
  const styles = buildStyles(palette);
  const currency = resolveCurrencyDisplay(menu.content.currency);
  const venue = menu.content.venue;
  const heading = venue?.name ?? menu.title;
  const contactLine = [venue?.address, venue?.phone].filter(Boolean).join(" · ");
  const [left = [], right = []] = distributeSequentially(menu.content.categories, COLUMN_COUNT);
  const qrDataUri = await buildQrDataUri(menu);

  return renderToBuffer(
    <Document title={menu.title}>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          {venue?.tagline && <Text style={styles.tagline}>{venue.tagline}</Text>}
          <Text style={styles.venueName}>{heading}</Text>
        </View>

        <View style={styles.columns}>
          {[left, right].map((group, index) => (
            <View key={index} style={styles.column}>
              {group.map((category) => (
                <BistroPdfCategory
                  key={category.id}
                  category={category}
                  currency={currency}
                  styles={styles}
                />
              ))}
            </View>
          ))}
        </View>

        {(contactLine || qrDataUri) && (
          <View style={styles.footer}>
            {contactLine && <Text style={styles.footerContact}>{contactLine}</Text>}
            {qrDataUri && (
              <View style={styles.footerQrRow}>
                <Image src={qrDataUri} style={styles.qr} />
                <Text style={styles.footerQrLabel}>{BISTRO_PDF_QR_LABEL}</Text>
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>,
  );
}
