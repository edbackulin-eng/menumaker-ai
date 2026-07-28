/**
 * A paragraph starting with "- " is rendered as a bullet-list item by
 * LegalDocument (src/components/legal/legal-document.tsx) — a plain-text
 * convention chosen so content files stay simple string arrays instead of
 * needing a richer markup format for what is, structurally, always just
 * "heading + paragraphs, some of which are lists".
 */
export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalDocument {
  title: string;
  intro: string[];
  sections: LegalSection[];
}
