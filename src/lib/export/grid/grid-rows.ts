import type { MenuItem } from "@/services/ai/schemas/menu-content";

/**
 * How many tiles per row the `grid` engine's *exports* use.
 *
 * Fixed, unlike the web renderer's responsive 2-or-3: a PDF page and a PNG
 * canvas have one known width each, so there is nothing to respond to.
 * Three is what the 1200px canvas and the A4 content box both fit at a tile
 * size where a 4:3 photo still reads.
 */
export const GRID_EXPORT_COLUMNS = 3;

/**
 * Splits a category's items into rows of GRID_EXPORT_COLUMNS, row-major.
 *
 * Row-major is the whole reason this exists: CSS Grid fills row-major, so
 * building the export rows the same way is what keeps dish order identical
 * across web, PDF and PNG. It is deliberately *not* like
 * `distributeSequentially`, which the Modern engine uses to mimic CSS
 * multi-column's newspaper fill — different layout primitive, different
 * fill order, and using the wrong one silently scrambles the menu.
 *
 * The last row is left short rather than padded: a trailing gap is correct
 * (the grid is left-aligned), and padding with empty tiles would draw
 * phantom bordered cards.
 */
export function chunkIntoRows(items: MenuItem[]): MenuItem[][] {
  const rows: MenuItem[][] = [];
  for (let i = 0; i < items.length; i += GRID_EXPORT_COLUMNS) {
    rows.push(items.slice(i, i + GRID_EXPORT_COLUMNS));
  }
  return rows;
}
