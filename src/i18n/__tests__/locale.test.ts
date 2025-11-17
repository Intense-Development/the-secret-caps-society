import { describe, it, expect } from "@jest/globals";
import {
  getLocaleDirection,
  getDefaultLocale,
  ensureValidLocale,
} from "../locale";

describe("i18n Locale Utilities", () => {
  describe("getLocaleDirection", () => {
    it("should return 'ltr' for English locale", () => {
      expect(getLocaleDirection("en")).toBe("ltr");
    });

    it("should return 'ltr' for Spanish locale", () => {
      expect(getLocaleDirection("es")).toBe("ltr");
    });

    it("should return 'rtl' for Arabic locale", () => {
      expect(getLocaleDirection("ar")).toBe("rtl");
    });

    it("should default to 'ltr' for invalid locale", () => {
      expect(getLocaleDirection("invalid")).toBe("ltr");
      expect(getLocaleDirection("fr")).toBe("ltr");
    });
  });

  describe("getDefaultLocale", () => {
    it("should return 'en' as default locale", () => {
      expect(getDefaultLocale()).toBe("en");
    });
  });

  describe("ensureValidLocale", () => {
    it("should return the locale code if valid", () => {
      expect(ensureValidLocale("en")).toBe("en");
      expect(ensureValidLocale("es")).toBe("es");
      expect(ensureValidLocale("ar")).toBe("ar");
    });

    it("should return default locale for invalid locale codes", () => {
      expect(ensureValidLocale("fr")).toBe("en");
      expect(ensureValidLocale("invalid")).toBe("en");
    });

    it("should return default locale for null or undefined", () => {
      expect(ensureValidLocale(null)).toBe("en");
      expect(ensureValidLocale(undefined)).toBe("en");
      expect(ensureValidLocale("")).toBe("en");
    });
  });
});

