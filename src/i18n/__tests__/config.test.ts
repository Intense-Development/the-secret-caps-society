import { describe, it, expect } from "@jest/globals";
import { locales, defaultLocale, isValidLocale } from "../config";

describe("i18n Configuration", () => {
  it("should export valid locale configuration", () => {
    expect(locales).toBeDefined();
    expect(Array.isArray(locales)).toBe(true);
    expect(locales.length).toBeGreaterThan(0);
  });

  it("should have default locale as 'en'", () => {
    expect(defaultLocale).toBe("en");
  });

  it("should include supported locales", () => {
    const localeCodes = locales.map((locale) => locale.code);
    expect(localeCodes).toContain("en");
    expect(localeCodes).toContain("es");
    expect(localeCodes).toContain("ar");
  });

  it("should have valid locale definitions with required properties", () => {
    locales.forEach((locale) => {
      expect(locale).toHaveProperty("code");
      expect(locale).toHaveProperty("name");
      expect(locale).toHaveProperty("dir");
      expect(typeof locale.code).toBe("string");
      expect(typeof locale.name).toBe("string");
      expect(["ltr", "rtl"]).toContain(locale.dir);
    });
  });

  it("should have 'ar' locale with dir: 'rtl'", () => {
    const arabicLocale = locales.find((locale) => locale.code === "ar");
    expect(arabicLocale).toBeDefined();
    expect(arabicLocale?.dir).toBe("rtl");
  });

  it("should have 'en' and 'es' locales with dir: 'ltr'", () => {
    const englishLocale = locales.find((locale) => locale.code === "en");
    const spanishLocale = locales.find((locale) => locale.code === "es");
    expect(englishLocale?.dir).toBe("ltr");
    expect(spanishLocale?.dir).toBe("ltr");
  });

  describe("isValidLocale", () => {
    it("should return true for valid locales", () => {
      expect(isValidLocale("en")).toBe(true);
      expect(isValidLocale("es")).toBe(true);
      expect(isValidLocale("ar")).toBe(true);
    });

    it("should return false for invalid locales", () => {
      expect(isValidLocale("fr")).toBe(false);
      expect(isValidLocale("invalid")).toBe(false);
      expect(isValidLocale("")).toBe(false);
    });
  });
});

