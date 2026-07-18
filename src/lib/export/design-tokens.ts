/**
 * Concrete hex values mirroring src/styles/globals.css's neutral scale —
 * needed because neither Satori (next/og, used for PNG) nor
 * @react-pdf/renderer (PDF) can resolve CSS custom properties the way a
 * real browser can. Keep in sync with globals.css manually if the design
 * system's neutral palette changes; there's no automated link between the
 * two given the fundamentally different rendering engines.
 */
export const EXPORT_TOKENS = {
  background: "#fafafa",
  surface: "#ffffff",
  foreground: "#171717",
  foregroundSecondary: "#525252",
  foregroundTertiary: "#a3a3a3",
  border: "#e5e5e5",
} as const;

/** Splits a list into N groups by round-robin — approximates the live preview's CSS `columns` (Satori/react-pdf support neither CSS multi-column nor break-inside, both flexbox-only). */
export function distributeIntoColumns<T>(items: T[], columns: number): T[][] {
  const result: T[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, index) => {
    result[index % columns]!.push(item);
  });
  return result;
}

/**
 * Splits a list into N groups sequentially — first chunk fills column 1,
 * next fills column 2, "newspaper" order.
 *
 * This is what CSS multi-column actually does, and therefore what the DOM
 * renderer produces. The round-robin version above interleaves instead
 * (1→left, 2→right, 3→left), which reads differently: with categories
 * [A,B,C], the browser shows A,B | C while round-robin shows A,C | B.
 * That mismatch is tolerable for the classic engine, whose exports have
 * always used round-robin, but the Modern template is specified as
 * "identical across Web/PDF/PNG", so its exports use this instead.
 *
 * Chunk sizes are ceil-based, so with 3 items over 2 columns the left
 * column gets 2 and the right gets 1 — matching how a browser balances a
 * short multi-column block.
 */
export function distributeSequentially<T>(items: T[], columns: number): T[][] {
  if (columns <= 1) return [items];
  const perColumn = Math.ceil(items.length / columns);
  const result: T[][] = [];
  for (let i = 0; i < columns; i++) {
    result.push(items.slice(i * perColumn, (i + 1) * perColumn));
  }
  return result;
}
