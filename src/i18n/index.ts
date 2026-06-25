/**
 * i18n Configuration for EthioBet Backend
 * Provides utility functions for resolving JSONB localized fields.
 */

export type SupportedLocale = "en" | "am";

export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "am"];
export const DEFAULT_LOCALE: SupportedLocale = "am";

/**
 * Represents a bilingual JSONB field stored in PostgreSQL.
 * Example: { "en": "Arsenal vs Chelsea", "am": "አርሰናል vs ቼልሲ" }
 */
export interface LocalizedField {
  en: string;
  am?: string;
}

/**
 * Resolves a localized JSONB field to the user's preferred language.
 * Falls back to English if the preferred locale is unavailable.
 */
export function resolveLocalized(
  field: LocalizedField,
  locale: SupportedLocale = DEFAULT_LOCALE
): string {
  return field[locale] || field.en;
}

/**
 * Validates that a JSONB object contains at least the 'en' key.
 */
export function isValidLocalizedField(field: unknown): field is LocalizedField {
  if (typeof field !== "object" || field === null) return false;
  const obj = field as Record<string, unknown>;
  return typeof obj.en === "string" && obj.en.length > 0;
}

/**
 * Creates a localized field with both languages.
 */
export function createLocalizedField(en: string, am?: string): LocalizedField {
  const field: LocalizedField = { en };
  if (am) field.am = am;
  return field;
}
