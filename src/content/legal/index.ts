import type { LocaleId } from "@/config/profile";

import { privacyDe, termsDe } from "./de";
import { privacyEn, termsEn } from "./en";
import { privacyEs, termsEs } from "./es";
import { privacyPl, termsPl } from "./pl";
import { privacyUk, termsUk } from "./uk";
import type { LegalDocument } from "./types";

export type { LegalDocument, LegalSection } from "./types";

const PRIVACY_BY_LOCALE: Record<LocaleId, LegalDocument> = {
  en: privacyEn,
  uk: privacyUk,
  de: privacyDe,
  pl: privacyPl,
  es: privacyEs,
};

const TERMS_BY_LOCALE: Record<LocaleId, LegalDocument> = {
  en: termsEn,
  uk: termsUk,
  de: termsDe,
  pl: termsPl,
  es: termsEs,
};

export function getPrivacyDocument(locale: LocaleId): LegalDocument {
  return PRIVACY_BY_LOCALE[locale];
}

export function getTermsDocument(locale: LocaleId): LegalDocument {
  return TERMS_BY_LOCALE[locale];
}
