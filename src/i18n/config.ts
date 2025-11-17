export type Locale = {
  code: string;
  name: string;
  dir: "ltr" | "rtl";
};

export const locales: Locale[] = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "es", name: "Español", dir: "ltr" },
  { code: "ar", name: "العربية", dir: "rtl" },
];

export const defaultLocale: string = "en";

export const localeCodes: string[] = locales.map((locale) => locale.code);

export function isValidLocale(locale: string): boolean {
  return localeCodes.includes(locale);
}

export function getLocale(localeCode: string): Locale | undefined {
  return locales.find((locale) => locale.code === localeCode);
}

