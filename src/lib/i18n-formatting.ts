/**
 * Formats a date according to the specified locale
 * @param date - The date to format
 * @param locale - The locale code (e.g., 'en', 'es', 'ar')
 * @param format - Optional format style ('short', 'long', 'relative')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  locale: string,
  format: "short" | "long" | "relative" = "short"
): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const localeMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    ar: "ar-SA",
  };

  const intlLocale = localeMap[locale] || "en-US";

  try {
    if (format === "relative") {
      // Simple relative time formatting
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" }).format(
          -diffInSeconds,
          "second"
        );
      } else if (diffInSeconds < 3600) {
        return new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" }).format(
          -Math.floor(diffInSeconds / 60),
          "minute"
        );
      } else if (diffInSeconds < 86400) {
        return new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" }).format(
          -Math.floor(diffInSeconds / 3600),
          "hour"
        );
      } else {
        return new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" }).format(
          -Math.floor(diffInSeconds / 86400),
          "day"
        );
      }
    }

    const options: Intl.DateTimeFormatOptions =
      format === "long"
        ? {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        : {
            year: "numeric",
            month: "short",
            day: "numeric",
          };

    return new Intl.DateTimeFormat(intlLocale, options).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return date.toLocaleDateString();
  }
}

/**
 * Formats a number according to the specified locale
 * @param number - The number to format
 * @param locale - The locale code (e.g., 'en', 'es', 'ar')
 * @returns Formatted number string
 */
export function formatNumber(number: number, locale: string): string {
  if (typeof number !== "number" || (isNaN(number) && !isFinite(number))) {
    return String(number);
  }

  const localeMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    ar: "ar-SA",
  };

  const intlLocale = localeMap[locale] || "en-US";

  try {
    return new Intl.NumberFormat(intlLocale).format(number);
  } catch (error) {
    console.error("Error formatting number:", error);
    return String(number);
  }
}

/**
 * Formats a currency amount according to the specified locale
 * @param amount - The amount to format
 * @param locale - The locale code (e.g., 'en', 'es', 'ar')
 * @param currency - The currency code (e.g., 'USD', 'EUR', 'MXN')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  locale: string,
  currency: string = "USD"
): string {
  if (typeof amount !== "number" || (isNaN(amount) && !isFinite(amount))) {
    return String(amount);
  }

  const localeMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    ar: "ar-SA",
  };

  const intlLocale = localeMap[locale] || "en-US";

  try {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return `${currency} ${amount}`;
  }
}

