import "server-only";
import ExcelJS from "exceljs";

/**
 * Excel is already row/column-structured, unlike a PDF/DOCX wall of text —
 * dumping cell values in reading order without any delimiters would throw
 * that structure away and give analyzeMenu() the same ambiguous blob it'd
 * get from a badly-OCR'd PDF. Instead, each row's non-empty cells are joined
 * with " | " (a clear column boundary the model can key off) and each
 * worksheet name is kept as a heading line, since sheet names are commonly
 * used as category names (e.g. "Напої", "Гарячі страви").
 */
export async function extractXlsxText(buffer: Buffer): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  // exceljs's .d.ts predates Node's newer generic `Buffer<TArrayBuffer>` type
  // and structurally rejects it despite being the same runtime object.
  await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);

  const sections: string[] = [];

  for (const worksheet of workbook.worksheets) {
    const lines: string[] = [];

    worksheet.eachRow((row) => {
      const cells: string[] = [];
      row.eachCell({ includeEmpty: false }, (cell) => {
        const value = cellToText(cell.value);
        if (value) cells.push(value);
      });
      if (cells.length > 0) {
        lines.push(cells.join(" | "));
      }
    });

    if (lines.length > 0) {
      sections.push(`## ${worksheet.name}\n${lines.join("\n")}`);
    }
  }

  return sections.join("\n\n").trim();
}

function cellToText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if ("richText" in value) {
      return value.richText.map((part) => part.text).join("");
    }
    if ("text" in value && typeof value.text === "string") {
      return value.text;
    }
    if ("result" in value) {
      return cellToText(value.result as ExcelJS.CellValue);
    }
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return "";
  }
  return String(value).trim();
}
