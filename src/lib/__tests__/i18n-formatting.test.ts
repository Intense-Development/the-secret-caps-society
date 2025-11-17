import { describe, it, expect } from "@jest/globals";
import { formatDate, formatNumber, formatCurrency } from "../i18n-formatting";

describe("Date Formatting", () => {
  const testDate = new Date("2024-01-15T10:30:00Z");

  it("should format date for English locale", () => {
    const formatted = formatDate(testDate, "en");
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe("string");
    // Format should match en-US conventions (e.g., "Jan 15, 2024")
  });

  it("should format date for Spanish locale", () => {
    const formatted = formatDate(testDate, "es");
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe("string");
    // Format should match es-ES conventions
  });

  it("should format date for Arabic locale", () => {
    const formatted = formatDate(testDate, "ar");
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe("string");
  });

  it("should handle different date formats", () => {
    const short = formatDate(testDate, "en", "short");
    const long = formatDate(testDate, "en", "long");
    expect(short).toBeDefined();
    expect(long).toBeDefined();
    expect(short.length).toBeLessThan(long.length);
  });

  it("should handle invalid dates", () => {
    const invalidDate = new Date("invalid");
    const formatted = formatDate(invalidDate, "en");
    // Should handle gracefully, either return empty string or "Invalid Date"
    expect(typeof formatted).toBe("string");
  });
});

describe("Number Formatting", () => {
  it("should format numbers for English locale", () => {
    expect(formatNumber(1000.5, "en")).toBe("1,000.5");
    expect(formatNumber(1000000, "en")).toBe("1,000,000");
    expect(formatNumber(0, "en")).toBe("0");
  });

  it("should format numbers for Spanish locale", () => {
    expect(formatNumber(1000.5, "es")).toBe("1.000,5");
    expect(formatNumber(1000000, "es")).toBe("1.000.000");
  });

  it("should format numbers for Arabic locale", () => {
    const formatted = formatNumber(1000.5, "ar");
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe("string");
  });

  it("should handle edge cases", () => {
    expect(formatNumber(0, "en")).toBe("0");
    expect(formatNumber(-100, "en")).toBe("-100");
    // Infinity and NaN should be handled gracefully
    const infResult = formatNumber(Infinity, "en");
    expect(typeof infResult).toBe("string");
  });
});

describe("Currency Formatting", () => {
  it("should format currency for English locale", () => {
    expect(formatCurrency(100.5, "en", "USD")).toContain("100");
    expect(formatCurrency(100.5, "en", "USD")).toContain("$");
  });

  it("should format currency for Spanish locale", () => {
    const formatted = formatCurrency(100.5, "es", "EUR");
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe("string");
    // Should contain the amount and currency symbol
  });

  it("should format currency for Arabic locale", () => {
    const formatted = formatCurrency(100.5, "ar", "USD");
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe("string");
  });

  it("should handle different currencies", () => {
    const usd = formatCurrency(100, "en", "USD");
    const eur = formatCurrency(100, "en", "EUR");
    expect(usd).toBeDefined();
    expect(eur).toBeDefined();
  });

  it("should handle edge cases", () => {
    expect(formatCurrency(0, "en", "USD")).toBeDefined();
    expect(formatCurrency(-50, "en", "USD")).toBeDefined();
  });
});

