import "server-only";
import type { ParsableSourceType } from "@/config/menu-generator";

import { extractDocxText } from "@/services/file-parser/docx";
import { extractPdfText } from "@/services/file-parser/pdf";
import { extractXlsxText } from "@/services/file-parser/xlsx";

/** Throws a plain Error on a malformed/corrupted file — callers wrap this into a user-facing ApiError (see menus/import/route.ts). */
export async function extractFileText(
  buffer: Buffer,
  sourceType: ParsableSourceType,
): Promise<string> {
  switch (sourceType) {
    case "pdf":
      return extractPdfText(buffer);
    case "docx":
      return extractDocxText(buffer);
    case "xlsx":
      return extractXlsxText(buffer);
  }
}
