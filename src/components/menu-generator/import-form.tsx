"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApiClientError } from "@/lib/api-client/api-client-error";
import { menusApi } from "@/lib/api-client/menus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FileDropzone } from "@/components/menu-generator/file-dropzone";

const ACCEPTED_FILE_TYPES =
  "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function ImportForm() {
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
      setError({ message: "Вкажіть назву меню.", isInsufficientCredits: false });
      return;
    }
    if (mode === "file" && !file) {
      setError({ message: "Оберіть файл для завантаження.", isInsufficientCredits: false });
      return;
    }
    if (mode === "text" && !text.trim()) {
      setError({ message: "Вставте текст меню.", isInsufficientCredits: false });
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
          message: "Сталася неочікувана помилка. Спробуйте ще раз.",
          isInsufficientCredits: false,
        });
      }
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      <Input
        label="Назва меню"
        placeholder="Напр. Літнє меню 2026"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
        disabled={isSubmitting}
      />

      <Tabs value={mode} onValueChange={(value) => setMode(value as "file" | "text")}>
        <TabsList>
          <TabsTrigger value="file" disabled={isSubmitting}>
            Завантажити файл
          </TabsTrigger>
          <TabsTrigger value="text" disabled={isSubmitting}>
            Вставити текст
          </TabsTrigger>
        </TabsList>
        <TabsContent value="file">
          <FileDropzone
            file={file}
            onFileChange={setFile}
            accept={ACCEPTED_FILE_TYPES}
            disabled={isSubmitting}
            hint="PDF, Word (.docx) або Excel (.xlsx), до 10MB"
          />
        </TabsContent>
        <TabsContent value="text">
          <Textarea
            label="Текст меню"
            placeholder="Вставте текст меню — категорії, страви, ціни..."
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
          {error.isInsufficientCredits && (
            <p className="mt-1">
              Поповнення кредитів буде доступне на сторінці Credits (з&apos;явиться на наступному
              етапі).
            </p>
          )}
        </div>
      )}

      <Button type="submit" isLoading={isSubmitting} className="self-start">
        {isSubmitting ? "AI аналізує меню..." : "Аналізувати меню"}
      </Button>
    </form>
  );
}
