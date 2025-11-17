import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing-config";

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that the incoming `locale` is valid
  const isValidLocale = (loc: string | null): loc is (typeof routing.locales)[number] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return loc !== null && routing.locales.includes(loc as any);
  };
  
  if (!isValidLocale(locale)) {
    locale = routing.defaultLocale;
  }

  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    // Fallback to English
    messages = (await import(`../../messages/en.json`)).default;
  }

  return {
    locale,
    messages,
  };
});

