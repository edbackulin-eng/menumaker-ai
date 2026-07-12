"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { ApiClientError } from "@/lib/api-client/api-client-error";
import { menusApi } from "@/lib/api-client/menus";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileDropzone } from "@/components/menu-generator/file-dropzone";

const ACCEPTED_FILE_TYPES =
  "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function ImportForm() {
  const t = useTranslations("menuGenerator.import");
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<{ message: string; isInsufficientCredits: boolean } | null>(
    null,
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError({ message: t("errors.titleRequired"), isInsufficientCredits: false });
      return;
    }
    if (mode === "file" && !file) {
      setError({ message: t("errors.fileRequired"), isInsufficientCredits: false });
      return;
    }
    if (mode === "text" && !text.trim()) {
      setError({ message: t("errors.textRequired"), isInsufficientCredits: false });
      return;
    }

    setIsSubmitting(true);
    try {
      const menu = await menusApi.import({
        title: title.trim(),
        mode,
        file: mode === "file" ? (file ?? undefined) : undefined,
        text: mode === "text" ? text : undefined,
      });
      router.push(`/menus/${menu.id}/review`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError({
          message: err.message,
          isInsufficientCredits: err.code === "insufficient_credits",
        });
      } else {
        setError({
          message: t("errors.unexpected"),
          isInsufficientCredits: false,
        });
      }
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <Input
        label={t("nameLabel")}
        placeholder={t("namePlaceholder")}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
        disabled={isSubmitting}
      />

      <Tabs value={mode} onValueChange={(value) => setMode(value as "file" | "text")}>
        <TabsList>
          <TabsTrigger value="file" disabled={isSubmitting}>
            {t("uploadTab")}
          </TabsTrigger>
          <TabsTrigger value="text" disabled={isSubmitting}>
            {t("textTab")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="file">
          <FileDropzone
            file={file}
            onFileChange={setFile}
            accept={ACCEPTED_FILE_TYPES}
            disabled={isSubmitting}
            hint={t("dropzoneHint")}
          />
        </TabsContent>
        <TabsContent value="text">
          <Textarea
            label={t("textLabel")}
            placeholder={t("textPlaceholder")}
            rows={10}
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={isSubmitting}
          />
        </TabsContent>
      </Tabs>

      {error && (
        <div className="border-error-400/30 bg-error-50 text-body-sm text-error-600 rounded-md border px-4 py-3">
          <p>{error.message}</p>
          {error.isInsufficientCredits && <p className="mt-1">{t("errors.creditsHint")}</p>}
        </div>
      )}

      <Button type="submit" isLoading={isSubmitting} className="self-start">
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
