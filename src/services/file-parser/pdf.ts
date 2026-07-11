import "server-only";
import { extractText, getDocumentProxy } from "unpdf";

/**
 * unpdf ships a serverless-optimized build of PDF.js (no native deps, no
 * filesystem debug-read at import time like the older `pdf-parse` package
 * has been known to trip on in bundled/serverless environments) — chosen
 * for that reason over `pdf-parse`. See docs/menu-generator.md.
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const document = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(document, { mergePages: true });
  return text.trim();
}
