import { describe, it, expect } from "@jest/globals";
import {
  getLocalePath,
  extractLocale,
  removeLocalePrefix,
  getPathnameWithoutLocale,
} from "../routing";

describe("i18n Routing", () => {
  describe("getLocalePath", () => {
    it("should generate correct locale paths", () => {
      expect(getLocalePath("/products", "es")).toBe("/es/products");
      expect(getLocalePath("/dashboard", "ar")).toBe("/ar/dashboard");
      expect(getLocalePath("/", "es")).toBe("/es");
    });

    it("should preserve query parameters", () => {
      expect(getLocalePath("/products?q=test", "es")).toBe("/es/products?q=test");
      expect(getLocalePath("/dashboard?tab=stats", "ar")).toBe(
        "/ar/dashboard?tab=stats"
      );
      expect(getLocalePath("/products?q=caps&sort=price", "es")).toBe(
        "/es/products?q=caps&sort=price"
      );
    });

    it("should handle paths that already have locale prefix", () => {
      expect(getLocalePath("/es/products", "ar")).toBe("/ar/products");
      expect(getLocalePath("/en/dashboard", "es")).toBe("/es/dashboard");
    });

    it("should handle root path", () => {
      expect(getLocalePath("/", "es")).toBe("/es");
      expect(getLocalePath("/", "ar")).toBe("/ar");
    });
  });

  describe("extractLocale", () => {
    it("should extract locale from pathname", () => {
      expect(extractLocale("/es/products")).toBe("es");
      expect(extractLocale("/ar/dashboard")).toBe("ar");
      expect(extractLocale("/en/login")).toBe("en");
    });

    it("should return null for pathname without locale prefix", () => {
      expect(extractLocale("/products")).toBeNull();
      expect(extractLocale("/dashboard")).toBeNull();
      expect(extractLocale("/")).toBeNull();
    });

    it("should return null for invalid locale in path", () => {
      expect(extractLocale("/fr/products")).toBeNull();
      expect(extractLocale("/invalid/path")).toBeNull();
    });
  });

  describe("removeLocalePrefix", () => {
    it("should remove locale prefix from pathname", () => {
      expect(removeLocalePrefix("/es/products")).toBe("/products");
      expect(removeLocalePrefix("/ar/dashboard")).toBe("/dashboard");
      expect(removeLocalePrefix("/en/login")).toBe("/login");
    });

    it("should return pathname unchanged if no locale prefix", () => {
      expect(removeLocalePrefix("/products")).toBe("/products");
      expect(removeLocalePrefix("/dashboard")).toBe("/dashboard");
      expect(removeLocalePrefix("/")).toBe("/");
    });

    it("should handle root locale paths", () => {
      expect(removeLocalePrefix("/es")).toBe("/");
      expect(removeLocalePrefix("/ar")).toBe("/");
      expect(removeLocalePrefix("/en")).toBe("/");
    });
  });

  describe("getPathnameWithoutLocale", () => {
    it("should return pathname without locale and query params", () => {
      expect(getPathnameWithoutLocale("/es/products?q=test")).toBe("/products");
      expect(getPathnameWithoutLocale("/ar/dashboard?tab=stats")).toBe(
        "/dashboard"
      );
      expect(getPathnameWithoutLocale("/en/login")).toBe("/login");
    });

    it("should handle root paths", () => {
      expect(getPathnameWithoutLocale("/es")).toBe("/");
      expect(getPathnameWithoutLocale("/ar?test=1")).toBe("/");
    });
  });
});

