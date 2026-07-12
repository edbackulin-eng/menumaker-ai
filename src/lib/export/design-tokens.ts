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
