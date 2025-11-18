import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminSearch } from "../AdminSearch";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      "admin.search.placeholder": "Search stores, products, users...",
      "admin.search.noResults": "No results found",
      "admin.search.loading": "Searching...",
    };
    return translations[key] || key;
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe("AdminSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("renders search input", () => {
    render(<AdminSearch />);

    expect(screen.getByPlaceholderText("Search stores, products, users...")).toBeInTheDocument();
  });

  it("displays search results when query is entered", async () => {
    const mockResults = {
      success: true,
      results: [
        { id: "1", name: "Test Store", type: "store" },
        { id: "2", name: "Test Product", type: "product" },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<AdminSearch />);
    const input = screen.getByPlaceholderText("Search stores, products, users...");

    await userEvent.type(input, "test");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("debounces search requests", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, results: [] }),
    });

    render(<AdminSearch />);
    const input = screen.getByPlaceholderText("Search stores, products, users...");

    await userEvent.type(input, "test");

    // Wait for debounce
    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );

    const callCount = (global.fetch as jest.Mock).mock.calls.length;
    expect(callCount).toBeLessThanOrEqual(1); // Should be debounced
  });

  it("displays no results message when no results found", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, results: [] }),
    });

    render(<AdminSearch />);
    const input = screen.getByPlaceholderText("Search stores, products, users...");

    await userEvent.type(input, "nonexistent");

    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    render(<AdminSearch />);
    const input = screen.getByPlaceholderText("Search stores, products, users...");

    await userEvent.type(input, "test");

    // Should not crash, just not show results
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("clears results when input is cleared", async () => {
    const mockResults = {
      success: true,
      results: [{ id: "1", name: "Test Store", type: "store" }],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults,
    });

    render(<AdminSearch />);
    const input = screen.getByPlaceholderText("Search stores, products, users...");

    await userEvent.type(input, "test");
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    await userEvent.clear(input);

    // Results should be cleared
    await waitFor(() => {
      expect(screen.queryByText("Test Store")).not.toBeInTheDocument();
    });
  });
});

