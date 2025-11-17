// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Messages = Record<string, any>; // Needed for dynamic message structure

/**
 * Loads messages for a given locale
 * This will be used by next-intl's getRequestConfig
 */
export async function loadMessages(locale: string): Promise<Messages> {
  try {
    const messages = await import(`../../messages/${locale}.json`);
    return messages.default || messages;
  } catch (error) {
    console.warn(`Failed to load messages for locale: ${locale}`, error);
    // Fallback to English
    if (locale !== "en") {
      const fallback = await import("../../messages/en.json");
      return fallback.default || fallback;
    }
    return {};
  }
}

/**
 * Gets a translation value from messages object using dot notation
 * @param messages - The messages object
 * @param key - The translation key (e.g., "nav.products")
 * @param params - Optional parameters for interpolation
 * @returns The translated string or the key if not found
 */
export function getTranslation(
  messages: Messages,
  key: string,
  params?: Record<string, string | number>
): string {
  const keys = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = messages; // Needed for dynamic property access

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key; // Return key if not found
    }
  }

  if (typeof value !== "string") {
    return key;
  }

  // Simple interpolation
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() ?? match;
    });
  }

  return value;
}

