import "server-only";
import {
  Document,
  Font,
  ImageBackground,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import { getAccentColorHex } from "@/config/menu-style";
import { pickReadableTextColor } from "@/lib/utils/color-contrast";
import {
  CORNER_RADIUS_PX,
  resolvePageForeground,
  type ResolvedMenuStyle,
} from "@/lib/utils/resolve-menu-style";
import { EXPORT_TOKENS } from "@/lib/export/design-tokens";
import { getPdfFontPath } from "@/lib/export/fonts";
import { linearGradientToDataUri } from "@/lib/export/pdf-gradient";
import type { ExportableMenu } from "@/services/export/load-menu";

const BODY_FONT_FAMILY = "MenuBodyFont";
const HEADING_FONT_FAMILY = "MenuHeadingFont";

/**
 * @react-pdf/renderer's `color`/fill handling supports `rgba()` fine
 * (verified directly — the translucent item-description text renders
 * correctly), but its `border`/`borderColor` (stroke) path does not: an
 * `rgba()` border color reproducibly rendered as solid red instead of the
 * requested translucent tone (reproduced in isolation with both the
 * `border` shorthand and the `borderColor` longhand, so it isn't a
 * shorthand-parsing issue — the stroke path itself doesn't handle alpha).
 * `resolvePageForeground`'s divider color is `rgba()` whenever a template
 * sets a custom `background` (translucent so it stays legible against any
 * background tone), so this alpha-composites it onto that background's
 * first color to get an equivalent solid hex — visually matches what a
 * browser renders, without hitting the broken stroke-alpha path.
 */
function compositeRgbaOnHex(rgba: string, backgroundHex: string): string {
  const match = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/.exec(rgba);
  if (!match) return rgba;
  const [, rStr, gStr, bStr, aStr] = match;
  const alpha = aStr !== undefined ? Number(aStr) : 1;
  const bgR = parseInt(backgroundHex.slice(1, 3), 16);
  const bgG = parseInt(backgroundHex.slice(3, 5), 16);
  const bgB = parseInt(backgroundHex.slice(5, 7), 16);
  const blend = (fg: number, bg: number) => Math.round(fg * alpha + bg * (1 - alpha));
  const channels = [blend(Number(rStr), bgR), blend(Number(gStr), bgG), blend(Number(bStr), bgB)];
  return `#${channels.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

// A4 in points (@react-pdf/renderer's native unit) — used to size the
// gradient SVG so it exactly fills the page with no stretch/tiling math.
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

/**
 * A4, single-column regardless of the menu's `columns` style setting — a
 * deliberate deviation, not an oversight. @react-pdf/renderer paginates by
 * measuring vertical flow within `<Page>`; multiple parallel flex columns
 * of uneven height (one category running long, another short) don't
 * reliably continue onto the next page in alignment with each other, and
 * the brief's hard requirement here is "correctly splits across pages,
 * never clips content" — that safety property matters more for a printed
 * document than exactly replicating the on-screen column count. See the
 * Stage 11 report for the full reasoning (also covers the PNG path, which
 * keeps the column layout since Satori images don't paginate at all).
 *
 * Stage 13 style-field coverage: @react-pdf/renderer has no CSS
 * `box-shadow` equivalent (verified directly — absent from its stylesheet
 * property list) so `cardShadow` has no visual effect here; every other
 * field (background, dual body/heading fonts, category header treatment,
 * corner radius, uppercase transform) is fully reproduced.
 * `background.type === "radial-gradient"` also isn't reproduced — react-pdf
 * has no radial-gradient primitive and no rotate/scale trick reproduces one
 * convincingly on a fixed rectangular page, so it falls back to the default
 * neutral page background instead of the wrong shape.
 */
export async function renderClassicPdf(menu: ExportableMenu): Promise<Buffer> {
  const style: ResolvedMenuStyle = menu.style;

  Font.register({ family: BODY_FONT_FAMILY, src: getPdfFontPath(style.fontId) });
  if (style.headingFontId !== style.fontId) {
    Font.register({ family: HEADING_FONT_FAMILY, src: getPdfFontPath(style.headingFontId) });
  }
  const headingFontFamily =
    style.headingFontId !== style.fontId ? HEADING_FONT_FAMILY : BODY_FONT_FAMILY;

  const accentHex = getAccentColorHex(style.accentColorId);
  const accentTextHex = pickReadableTextColor(accentHex);
  const pageForeground = resolvePageForeground(style.background);
  const radiusPx = CORNER_RADIUS_PX[style.cornerRadius];
  const opaqueCard = !style.background;
  const backgroundApproxHex = style.background?.colors[0] ?? EXPORT_TOKENS.background;
  const dividerColor = opaqueCard
    ? EXPORT_TOKENS.border
    : compositeRgbaOnHex(pageForeground.divider, backgroundApproxHex);

  const backgroundImageUri =
    style.background && style.background.type === "linear-gradient"
      ? await linearGradientToDataUri(style.background, PAGE_WIDTH, PAGE_HEIGHT)
      : null;
  const solidBackgroundColor =
    style.background && style.background.type === "solid"
      ? style.background.colors[0]
      : EXPORT_TOKENS.background;

  const uppercase = style.categoryNameTransform === "uppercase";

  const styles = StyleSheet.create({
    page: {
      fontFamily: BODY_FONT_FAMILY,
      ...(backgroundImageUri ? {} : { backgroundColor: solidBackgroundColor }),
    },
    content: { padding: 36 },
    title: {
      fontFamily: headingFontFamily,
      fontSize: 24,
      fontWeight: 700,
      color: pageForeground.primary,
      marginBottom: 20,
    },
    category: {
      marginBottom: 14,
      borderRadius: radiusPx,
      border: `1px solid ${dividerColor}`,
      ...(opaqueCard ? { backgroundColor: EXPORT_TOKENS.surface } : {}),
    },
    categoryHeaderBar: {
      padding: "8px 12px",
      // Longhand per-corner properties, not the `"Npx Npx 0 0"` shorthand
      // string — that shorthand reproducibly painted a solid black block
      // over this element instead of applying the radius (reproduced in
      // isolation; the longhand form does not have this bug).
      borderTopLeftRadius: radiusPx,
      borderTopRightRadius: radiusPx,
      backgroundColor: accentHex,
    },
    categoryHeaderUnderline: {
      padding: "12px 12px 8px",
      borderBottom: `2px solid ${accentHex}`,
    },
    categoryHeaderBoxedWrapper: { padding: "12px 12px 8px" },
    categoryHeaderBoxed: {
      padding: "5px 10px",
      border: `1.5px solid ${accentHex}`,
      borderRadius: Math.max(radiusPx - 2, 0),
      alignSelf: "flex-start",
    },
    categoryName: {
      fontFamily: headingFontFamily,
      fontSize: 14,
      fontWeight: 700,
      ...(uppercase ? { textTransform: "uppercase" as const, letterSpacing: 0.6 } : {}),
    },
    itemsWrapper: { padding: "2px 12px" },
    item: {
      flexDirection: "column",
      borderBottom: `1px solid ${dividerColor}`,
      paddingTop: 8,
      paddingBottom: 8,
    },
    itemRow: { flexDirection: "row", justifyContent: "space-between" },
    itemName: { fontSize: 11, fontWeight: 500, color: pageForeground.primary },
    itemPrice: { fontSize: 11, fontWeight: 700, color: pageForeground.primary },
    itemDescription: { fontSize: 9, color: pageForeground.secondary, marginTop: 2 },
  });

  const menuBody = (
    <View style={styles.content}>
      <Text style={styles.title}>{menu.title}</Text>
      {menu.content.categories.map((category) => (
        <View key={category.id} style={styles.category} wrap minPresenceAhead={40}>
          {style.categoryHeaderStyle === "solid-bar" && (
            // A per-corner `borderRadius` shorthand applied directly to a
            // `Text` node reproducibly broke rendering (the fill painted as
            // a solid black block over the text instead of the accent
            // color) — reproduced in isolation and confirmed fixed by
            // moving the radius/background onto a wrapping `View` instead,
            // matching how the underline/boxed-outline variants below
            // already structure their header (a `View` carrying
            // background/border, a plain `Text` for the label).
            <View style={styles.categoryHeaderBar}>
              <Text style={[styles.categoryName, { color: accentTextHex }]}>{category.name}</Text>
            </View>
          )}
          {style.categoryHeaderStyle === "underline" && (
            <View style={styles.categoryHeaderUnderline}>
              <Text style={[styles.categoryName, { color: accentHex }]}>{category.name}</Text>
            </View>
          )}
          {style.categoryHeaderStyle === "boxed-outline" && (
            <View style={styles.categoryHeaderBoxedWrapper}>
              <View style={styles.categoryHeaderBoxed}>
                <Text style={[styles.categoryName, { color: accentHex }]}>{category.name}</Text>
              </View>
            </View>
          )}
          <View style={styles.itemsWrapper}>
            {category.items.map((item) => (
              <View key={item.id} style={styles.item} wrap={false}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.price !== undefined && (
                    <Text style={styles.itemPrice}>
                      {item.price} {menu.content.currency ?? ""}
                    </Text>
                  )}
                </View>
                {item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const doc = (
    <Document title={menu.title}>
      <Page size="A4" style={styles.page} wrap>
        {backgroundImageUri ? (
          <ImageBackground src={backgroundImageUri} style={{ width: "100%", minHeight: "100%" }}>
            {menuBody}
          </ImageBackground>
        ) : (
          menuBody
        )}
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
