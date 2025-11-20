"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { getLocaleDirection } from "@/i18n/locale";

/**
 * Client component to set locale-specific HTML attributes
 * Since Next.js 15 requires html/body in root layout, we update attributes dynamically
 */
export function LocaleHtmlAttributes() {
  let locale: string;
  let direction: "ltr" | "rtl";
  
  try {
    locale = useLocale();
    direction = getLocaleDirection(locale);
  } catch (error) {
    // Fallback if useLocale fails
    console.error("Error getting locale:", error);
    locale = "en";
    direction = "ltr";
  }

  useEffect(() => {
    if (typeof document !== "undefined") {
      // Update html lang and dir attributes
      document.documentElement.lang = locale;
      document.documentElement.dir = direction;
    }
  }, [locale, direction]);

  return null;
}

