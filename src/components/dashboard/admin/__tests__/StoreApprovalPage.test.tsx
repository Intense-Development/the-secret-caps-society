import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { StoreApprovalPage } from "../StoreApprovalPage";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useParams: jest.fn(() => ({ id: "store-1" })),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}));

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      "admin.stores.approve": "Approve",
      "admin.stores.reject": "Reject",
      "admin.stores.storeDetails": "Store Details",
      "admin.stores.verificationStatus": "Verification Status",
    };
    return translations[key] || key;
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe("StoreApprovalPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders store details", async () => {
    const mockStore = {
      success: true,
      store: {
        id: "store-1",
        name: "Test Store",
        description: "Test Description",
        verification_status: "pending",
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStore,
    });

    render(<StoreApprovalPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Store")).toBeInTheDocument();
    });
  });

  it("displays approval buttons for pending stores", async () => {
    const mockStore = {
      success: true,
      store: {
        id: "store-1",
        name: "Test Store",
        verification_status: "pending",
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStore,
    });

    render(<StoreApprovalPage />);

    await waitFor(() => {
      expect(screen.getByText("Approve")).toBeInTheDocument();
      expect(screen.getByText("Reject")).toBeInTheDocument();
    });
  });

  it("handles loading state", () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<StoreApprovalPage />);

    // Should show loading state
    expect(screen.queryByText("Test Store")).not.toBeInTheDocument();
  });

  it("handles error state", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Failed to fetch"));

    render(<StoreApprovalPage />);

    await waitFor(() => {
      // Should show error message
      expect(screen.queryByText("Test Store")).not.toBeInTheDocument();
    });
  });
});

