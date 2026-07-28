import { apiSuccess } from "@/lib/api/respond";
import { requireAuth } from "@/lib/api/require-auth";
import { withApiHandler } from "@/lib/api/with-api-handler";
import { ApiError, ValidationError } from "@/lib/errors";
import { importMenuSchema, MAX_RAW_TEXT_LENGTH } from "@/lib/validations/menu-import";
import { extractFileText } from "@/services/file-parser";
import {
  assertMenuCreationEligible,
  analyzeMenuWithCreditGate,
} from "@/services/menu-generator/menu-creation-credit";
import { deleteMenuFileSafe, uploadMenuFile } from "@/services/menu-generator/storage";
import { validateMenuFile } from "@/services/menu-generator/file-validation";
import type { Json } from "@/types/database.types";

// File parsing (PDF/DOCX/XLSX) plus the AI analysis call together can run
// well past Vercel's default function timeout on a large source document.
export const maxDuration = 60;

/**
 * Step 1 of the wizard (Import). Unlike every other Route Handler in this
 * codebase, the body isn't JSON — a file upload requires multipart/form-data
 * — so this bypasses validateBody() and parses request.formData() directly.
 *
 * Creates the `menus` row immediately (status='processing') rather than
 * waiting until the AI analysis finishes: this is the DB-backed intermediate
 * state the wizard's Review step (and a page reload on it) relies on — see
 * docs/menu-generator.md.
 */
export const POST = withApiHandler(
  async (request) => {
    const { user, supabase } = await requireAuth();

    const form = await request.formData();
    const parsed = importMenuSchema.safeParse({
      title: form.get("title"),
      mode: form.get("mode"),
      text: form.get("text") ?? undefined,
      locale: form.get("locale") ?? undefined,
    });
    if (!parsed.success) {
      throw new ValidationError(parsed.error);
    }
    const { title, mode, text, locale: inputLocale } = parsed.data;

    // Cheap pre-flight — avoid parsing/uploading/AI work for a request that
    // can't be charged anyway. The real, race-safe check happens later.
    await assertMenuCreationEligible(user.id);

    let file: File | null = null;
    const sourceType = (() => {
      if (mode === "text") return "text" as const;
      const candidate = form.get("file");
      if (!(candidate instanceof File)) {
        throw new ApiError(422, "file_required", "Файл обов'язковий для цього режиму.");
      }
      file = candidate;
      return validateMenuFile(candidate);
    })();

    let locale = inputLocale;
    if (!locale) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("locale")
        .eq("id", user.id)
        .single();
      locale = profile?.locale ?? "en";
    }

    const { data: menu, error: insertError } = await supabase
      .from("menus")
      .insert({ user_id: user.id, title, source_type: sourceType, status: "processing", locale })
      .select()
      .single();
    if (insertError || !menu) {
      throw new ApiError(500, "db_error", "Не вдалося створити меню.");
    }

    let uploadedPath: string | null = null;

    try {
      let rawText: string;

      if (file) {
        uploadedPath = await uploadMenuFile(user.id, menu.id, file);
        const buffer = Buffer.from(await file.arrayBuffer());
        try {
          rawText = await extractFileText(buffer, sourceType as "pdf" | "docx" | "xlsx");
        } catch {
          throw new ApiError(
            422,
            "file_parse_failed",
            "Не вдалося прочитати файл. Перевірте, що він не пошкоджений і має правильний формат.",
          );
        }
      } else {
        rawText = text!;
      }

      if (rawText.trim().length === 0) {
        throw new ApiError(
          422,
          "empty_file_content",
          "Не вдалося розпізнати текст — файл порожній або є скан-зображенням без текстового шару.",
        );
      }
      if (rawText.length > MAX_RAW_TEXT_LENGTH) {
        throw new ApiError(
          422,
          "content_too_long",
          `Розпізнаний текст перевищує ${MAX_RAW_TEXT_LENGTH} символів. Спробуйте менший файл.`,
        );
      }

      const { content, usedFreeMenu, balance } = await analyzeMenuWithCreditGate(
        user.id,
        menu.id,
        rawText,
      );

      const { data: updated, error: updateError } = await supabase
        .from("menus")
        .update({
          content: content as unknown as Json,
          status: "draft",
        })
        .eq("id", menu.id)
        .select()
        .single();
      if (updateError || !updated) {
        throw new ApiError(500, "db_error", "Не вдалося зберегти розпізнані дані меню.");
      }

      // GDPR data minimisation (docs/privacy-audit.md): the uploaded source
      // file is written to Storage once and never read again anywhere in
      // the codebase past this point — the wizard's Review/Editor/Result
      // steps all work off `menus.content`, and there is no UI path back to
      // Import for an existing menu. Deleting it right after a successful
      // parse (rather than leaving it until account deletion) means we stop
      // holding a copy of the user's raw document the moment it has served
      // its purpose. `original_file_url` is deliberately no longer written
      // above — a path to a file that won't exist would just be a dangling
      // reference.
      if (uploadedPath) {
        await deleteMenuFileSafe(uploadedPath);
      }

      return apiSuccess({ ...updated, usedFreeMenu, creditsBalance: balance }, 201);
    } catch (error) {
      await supabase.from("menus").update({ status: "failed" }).eq("id", menu.id);
      if (uploadedPath) {
        await deleteMenuFileSafe(uploadedPath);
      }
      throw error;
    }
  },
  { rateLimitTier: "ai" },
);
