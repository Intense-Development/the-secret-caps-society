import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { loadMessages, getTranslation } from "../messages";

// Mock next-intl's getRequestConfig or message loading
jest.mock("next-intl", () => ({
  getRequestConfig: jest.fn(),
}));

describe("Message Loading", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should load English messages successfully", async () => {
    const messages = await loadMessages("en");
    expect(messages).toBeDefined();
    expect(typeof messages).toBe("object");
    expect(messages.nav).toBeDefined();
    expect(messages.nav.products).toBe("Products");
    expect(messages.hero).toBeDefined();
    expect(messages.hero.title).toBe("The Premium Marketplace for Cap Resellers");
  });

  it("should load Spanish messages successfully", async () => {
    const messages = await loadMessages("es");
    expect(messages).toBeDefined();
    expect(typeof messages).toBe("object");
    expect(messages.nav).toBeDefined();
    expect(messages.nav.products).toBe("Productos");
    expect(messages.hero.title).toBe("El Mercado Premium para Revendedores de Gorras");
  });

  it("should load Arabic messages successfully", async () => {
    const messages = await loadMessages("ar");
    expect(messages).toBeDefined();
    expect(typeof messages).toBe("object");
    expect(messages.nav).toBeDefined();
    expect(messages.nav.products).toBe("المنتجات");
  });

  it("should fallback to English when locale file missing", async () => {
    // This test would require mocking file system
    // For now, we test that loadMessages handles errors gracefully
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages = await loadMessages("fr" as any); // Type assertion needed for test
    // Should fallback to English
    expect(messages).toBeDefined();
  });

  it("should get translation for valid key", () => {
    const messages = { nav: { products: "Products" } };
    expect(getTranslation(messages, "nav.products")).toBe("Products");
  });

  it("should handle nested keys", () => {
    const messages = {
      nav: { products: "Products", stores: "Stores" },
      hero: { title: "Title" },
    };
    expect(getTranslation(messages, "nav.products")).toBe("Products");
    expect(getTranslation(messages, "hero.title")).toBe("Title");
  });

  it("should return key if translation not found", () => {
    const messages = { nav: { products: "Products" } };
    expect(getTranslation(messages, "nav.nonexistent")).toBe("nav.nonexistent");
    expect(getTranslation(messages, "invalid.key")).toBe("invalid.key");
  });

  it("should handle interpolation in translations", () => {
    const messages = {
      hero: { trustedBy: "Trusted by {count}+ resellers" },
    };
    const translation = getTranslation(messages, "hero.trustedBy", { count: 500 });
    expect(translation).toContain("500");
    expect(translation).toContain("resellers");
  });
});

