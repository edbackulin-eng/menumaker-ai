import "server-only";
import { Document, Font, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";

import { getAccentColorHex } from "@/config/menu-style";
import { pickReadableTextColor } from "@/lib/utils/color-contrast";
import { EXPORT_TOKENS } from "@/lib/export/design-tokens";
import { getPdfFontPath } from "@/lib/export/fonts";
import type { ExportableMenu } from "@/services/export/load-menu";

const styles = StyleSheet.create({
  page: { padding: 36, backgroundColor: EXPORT_TOKENS.background, fontFamily: "MenuFont" },
  title: { fontSize: 24, fontWeight: 700, color: EXPORT_TOKENS.foreground, marginBottom: 20 },
  category: {
    marginBottom: 14,
    borderRadius: 4,
    border: `1px solid ${EXPORT_TOKENS.border}`,
  },
  categoryHeader: { padding: "8px 12px", fontSize: 14, fontWeight: 700 },
  itemsWrapper: { padding: "2px 12px" },
  item: {
    flexDirection: "column",
    borderBottom: `1px solid ${EXPORT_TOKENS.border}`,
    paddingTop: 8,
    paddingBottom: 8,
  },
  itemRow: { flexDirection: "row", justifyContent: "space-between" },
  itemName: { fontSize: 11, fontWeight: 500, color: EXPORT_TOKENS.foreground },
  itemPrice: { fontSize: 11, fontWeight: 700, color: EXPORT_TOKENS.foreground },
  itemDescription: { fontSize: 9, color: EXPORT_TOKENS.foregroundSecondary, marginTop: 2 },
});

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
 */
export async function renderMenuPdf(menu: ExportableMenu): Promise<Buffer> {
  const fontFamily = "MenuFont";
  Font.register({ family: fontFamily, src: getPdfFontPath(menu.style.fontId) });

  const accentHex = getAccentColorHex(menu.style.accentColorId);
  const accentTextHex = pickReadableTextColor(accentHex);

  const doc = (
    <Document title={menu.title}>
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.title}>{menu.title}</Text>
        {menu.content.categories.map((category) => (
          <View key={category.id} style={styles.category} wrap minPresenceAhead={40}>
            <Text
              style={[styles.categoryHeader, { backgroundColor: accentHex, color: accentTextHex }]}
            >
              {category.name}
            </Text>
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
                  {item.description && (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
