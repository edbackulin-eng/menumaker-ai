"use client";

import { Check } from "lucide-react";

import {
  CURATED_ACCENT_COLORS,
  CURATED_FONTS,
  LAYOUT_COLUMN_OPTIONS,
  type AccentColorId,
  type FontId,
  type LayoutColumns,
} from "@/config/menu-style";
import { FONT_ID_TO_CSS_VARIABLE } from "@/lib/fonts/menu-fonts";
import {
  contrastRatio,
  pickReadableTextColor,
  WCAG_AA_NORMAL_TEXT_RATIO,
} from "@/lib/utils/color-contrast";
import { cn } from "@/lib/utils/cn";

export interface EditorControlsPanelProps {
  accentColorId: AccentColorId;
  fontId: FontId;
  columns: LayoutColumns;
  onAccentColorChange: (id: AccentColorId) => void;
  onFontChange: (id: FontId) => void;
  onColumnsChange: (columns: LayoutColumns) => void;
  className?: string;
}

export function EditorControlsPanel({
  accentColorId,
  fontId,
  columns,
  onAccentColorChange,
  onFontChange,
  onColumnsChange,
  className,
}: EditorControlsPanelProps) {
  const selectedHex = CURATED_ACCENT_COLORS.find((c) => c.id === accentColorId)?.hex ?? "#000000";
  const textOnAccent = pickReadableTextColor(selectedHex);
  const ratio = contrastRatio(selectedHex, textOnAccent);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <section className="flex flex-col gap-2">
        <h3 className="text-body-sm text-foreground font-medium">Акцентний колір</h3>
        <div className="grid grid-cols-4 gap-2">
          {CURATED_ACCENT_COLORS.map((color) => {
            const isSelected = color.id === accentColorId;
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => onAccentColorChange(color.id)}
                aria-pressed={isSelected}
                aria-label={color.label}
                title={color.label}
                className={cn(
                  "duration-fast flex size-10 items-center justify-center rounded-full transition-transform",
                  isSelected && "ring-ring ring-2 ring-offset-2",
                )}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && (
                  <Check
                    className="size-4"
                    style={{ color: pickReadableTextColor(color.hex) }}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
        <p className="text-caption text-foreground-secondary">
          Контраст тексту на акценті: {ratio.toFixed(1)}:1{" "}
          {ratio >= WCAG_AA_NORMAL_TEXT_RATIO ? "✓ WCAG AA" : "(текст автоматично підбирається)"}
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-body-sm text-foreground font-medium">Шрифт</h3>
        <div className="grid grid-cols-2 gap-2">
          {CURATED_FONTS.map((font) => {
            const isSelected = font.id === fontId;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => onFontChange(font.id)}
                aria-pressed={isSelected}
                className={cn(
                  "border-border duration-fast flex h-14 items-center justify-center rounded-md border px-2 text-center transition-colors",
                  isSelected
                    ? "border-accent-400 bg-accent-50 text-accent-800"
                    : "hover:bg-surface-secondary",
                )}
                style={{ fontFamily: FONT_ID_TO_CSS_VARIABLE[font.id] }}
              >
                {font.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-body-sm text-foreground font-medium">Кількість колонок</h3>
        <div className="flex gap-2">
          {LAYOUT_COLUMN_OPTIONS.map((columnOption) => {
            const isSelected = columnOption === columns;
            return (
              <button
                key={columnOption}
                type="button"
                onClick={() => onColumnsChange(columnOption)}
                aria-pressed={isSelected}
                className={cn(
                  "border-border duration-fast flex h-10 flex-1 items-center justify-center rounded-md border font-medium transition-colors",
                  isSelected
                    ? "border-accent-400 bg-accent-50 text-accent-800"
                    : "hover:bg-surface-secondary",
                )}
              >
                {columnOption}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
