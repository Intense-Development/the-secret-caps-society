import { getLocale, defaultLocale, isValidLocale } from "./config";

/**
 * Gets the locale direction (ltr or rtl) for a given locale code
 * @param localeCode - The locale code
 * @returns The direction ('ltr' or 'rtl')
 */
export function getLocaleDirection(localeCode: string): "ltr" | "rtl" {
  const locale = getLocale(localeCode);
  return locale?.dir ?? "ltr";
}

/**
 * Gets the default locale code
 * @returns The default locale code
 */
export function getDefaultLocale(): string {
  return defaultLocale;
}

/**
 * Validates and returns a valid locale code, falling back to default if invalid
 * @param localeCode - The locale code to validate
 * @returns A valid locale code
 */
export function ensureValidLocale(localeCode: string | null | undefined): string {
  if (!localeCode || !isValidLocale(localeCode)) {
    return defaultLocale;
  }
  return localeCode;
}

