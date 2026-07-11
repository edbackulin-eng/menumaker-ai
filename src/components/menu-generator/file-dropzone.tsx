"use client";

import { FileText, Upload, X } from "lucide-react";
import { useId, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

export interface FileDropzoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept: string;
  disabled?: boolean;
  hint?: string;
}

/** Standard file-upload drop zone (drag-and-drop + click-to-browse) — not to be confused with the future drag-and-drop *menu style* editor (a separate, later stage). */
export function FileDropzone({ file, onFileChange, accept, disabled, hint }: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  function handleFiles(fileList: FileList | null) {
    const selected = fileList?.[0];
    if (selected) onFileChange(selected);
  }

  if (file) {
    return (
      <div className="border-border bg-surface flex items-center gap-3 rounded-md border p-4">
        <FileText className="text-accent-600 size-6 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-body-sm truncate font-medium">{file.name}</p>
          <p className="text-caption text-foreground-secondary">
            {(file.size / 1024).toFixed(0)} KB
          </p>
        </div>
        <button
          type="button"
          onClick={() => onFileChange(null)}
          disabled={disabled}
          aria-label="Прибрати файл"
          className="text-foreground-secondary hover:text-foreground hover:bg-surface-secondary flex size-8 shrink-0 items-center justify-center rounded-md"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (!disabled && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragActive(false);
        if (!disabled) handleFiles(event.dataTransfer.files);
      }}
      className={cn(
        "duration-fast flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-10 text-center transition-colors",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        isDragActive ? "border-accent-400 bg-accent-50" : "border-border bg-surface-secondary",
      )}
    >
      <Upload className="text-foreground-secondary size-8" aria-hidden="true" />
      <p className="text-body-sm font-medium">Перетягніть файл сюди або натисніть, щоб обрати</p>
      {hint && <p className="text-caption text-foreground-secondary">{hint}</p>}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}
