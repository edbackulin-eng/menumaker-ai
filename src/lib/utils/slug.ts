/**
 * Ukrainian/Russian Cyrillic -> Latin transliteration, close to the
 * official Ukrainian national romanization system (used for passports/
 * street signs) — chosen because most menu titles this app sees are
 * Ukrainian. Multi-character mappings (щ -> shch, ю -> iu, ...) are handled
 * by longest-match-first ordering in `transliterate()` below, not by this
 * table's shape.
 */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "h",
  ґ: "g",
  д: "d",
  е: "e",
  є: "ie",
  ж: "zh",
  з: "z",
  и: "y",
  і: "i",
  ї: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ь: "",
  ю: "iu",
  я: "ia",
  ъ: "",
  ы: "y",
  э: "e",
  ё: "e",
};

function transliterate(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join("");
}

const MAX_BASE_LENGTH = 48;
const SUFFIX_LENGTH = 6;
const SUFFIX_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomSuffix(): string {
  let result = "";
  for (let i = 0; i < SUFFIX_LENGTH; i++) {
    result += SUFFIX_ALPHABET[Math.floor(Math.random() * SUFFIX_ALPHABET.length)];
  }
  return result;
}

/** Kebab-cases arbitrary text (any script) into a URL-safe slug fragment — no length cap, no uniqueness suffix; see generateSlugSuggestion for the fallback that adds those. */
export function slugify(text: string): string {
  return transliterate(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Default `public_slug` when a user doesn't pick their own — used as the
 * fallback in the publish flow (POST /api/menus/[id]/publish), never as a
 * validation target itself. Deliberately readable (title-derived), not a
 * bare random id: a better default is still a better default even when the
 * user never looks at it.
 */
export function generateSlugSuggestion(title: string): string {
  const base = slugify(title).slice(0, MAX_BASE_LENGTH).replace(/-+$/, "");
  const suffix = randomSuffix();
  return base ? `${base}-${suffix}` : `menu-${suffix}`;
}
