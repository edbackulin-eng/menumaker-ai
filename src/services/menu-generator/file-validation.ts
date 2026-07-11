import "server-only";

import {
  ALLOWED_FILE_MIME_TYPES,
  MENU_GENERATOR_CONFIG,
  type ParsableSourceType,
} from "@/config/menu-generator";
import { ApiError } from "@/lib/errors";

/** Throws a clear, user-facing ApiError on an oversized or unsupported file — never silently accepts or truncates. */
export function validateMenuFile(file: File): ParsableSourceType {
  if (file.size === 0) {
    throw new ApiError(422, "empty_file", "Файл порожній.");
  }
  if (file.size > MENU_GENERATOR_CONFIG.maxFileSizeBytes) {
    const limitMb = MENU_GENERATOR_CONFIG.maxFileSizeBytes / (1024 * 1024);
    throw new ApiError(422, "file_too_large", `Файл завеликий — максимум ${limitMb}MB.`);
  }

  const sourceType = ALLOWED_FILE_MIME_TYPES[file.type];
  if (!sourceType) {
    throw new ApiError(
      422,
      "unsupported_file_type",
      "Непідтримуваний тип файлу. Завантажте PDF, Word (.docx) або Excel (.xlsx).",
    );
  }

  return sourceType;
}
