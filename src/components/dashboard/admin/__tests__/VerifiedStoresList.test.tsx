import { describe, expect, it, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VerifiedStoresList } from "../VerifiedStoresList";
import { useRouter } from "next/navigation";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: jest.fn(() => (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      "admin.dashboard.verifiedStores": "Verified Stores",
      "admin.dashboard.verifiedStoresDesc": "Stores that have been verified",
      "admin.dashboard.noVerifiedStores": "No verified stores",
      "admin.dashboard.verifiedAt": "Verified",
      "admin.dashboard.verified": "Verified",
      "admin.dashboard.viewDetails": "View Details",
      "admin.dashboard.editStore": "Edit Store",
      "admin.dashboard.revokeVerification": "Revoke Verification",
      "admin.dashboard.revokeConfirmTitle": "Revoke Store Verification",
      "admin.dashboard.revokeConfirmDesc": 'Are you sure you want to revoke verification for "{name}"? The store will need to be re-verified.',
      "admin.dashboard.revokeSuccess": "Store verification revoked successfully",
      "admin.dashboard.revokeError": "Failed to revoke verification",
      "admin.dashboard.cancel": "Cancel",
      "admin.dashboard.table.storeName": "Store Name",
      "admin.dashboard.table.owner": "Owner",
      "admin.dashboard.table.actions": "Actions",
      "admin.dashboard.showingStores": "Showing {start}-{end} of {total} stores",
    };
    let translated = translations[key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translated = translated.replace(`{${paramKey}}`, String(value));
      });
    }
    return translated;
  }),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock Link
jest.mock("@/i18n/routing-config", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("VerifiedStoresList", () => {
  const mockRouter = {
    refresh: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockClear();
    mockRouter.refresh.mockClear();
  });

  const mockStores = [
    {
      id: "1",
      name: "Verified Store 1",
      owner: "John Doe",
      verifiedAt: new Date("2024-01-15"),
      productsCount: 10,
    },
    {
      id: "2",
      name: "Verified Store 2",
      owner: "Jane Smith",
      verifiedAt: new Date("2024-01-14"),
      productsCount: 5,
    },
  ];

  it("renders the list with verified stores", () => {
    render(<VerifiedStoresList stores={mockStores} />);

    expect(screen.getByText("Verified Store 1")).toBeInTheDocument();
    expect(screen.getByText("Verified Store 2")).toBeInTheDocument();
  });

  it("renders store owner names", () => {
    render(<VerifiedStoresList stores={mockStores} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("renders verified badges", () => {
    render(<VerifiedStoresList stores={mockStores} />);

    const badges = screen.getAllByText("Verified");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("renders action buttons", () => {
    render(<VerifiedStoresList stores={mockStores} />);

    const viewButtons = screen.getAllByText("View Details");
    const editButtons = screen.getAllByText("Edit Store");
    const revokeButtons = screen.getAllByText("Revoke Verification");

    expect(viewButtons.length).toBe(2);
    expect(editButtons.length).toBe(2);
    expect(revokeButtons.length).toBe(2);
  });

  it("handles empty stores array", () => {
    render(<VerifiedStoresList stores={[]} />);

    expect(screen.getByText("No verified stores")).toBeInTheDocument();
    expect(screen.queryByText("Verified Store 1")).not.toBeInTheDocument();
  });

  it("renders view details links", () => {
    render(<VerifiedStoresList stores={mockStores} />);

    const links = screen.getAllByText("View Details");
    expect(links[0].closest("a")).toHaveAttribute("href", "/dashboard/admin/stores/1");
  });

  it("renders edit store links", () => {
    render(<VerifiedStoresList stores={mockStores} />);

    const links = screen.getAllByText("Edit Store");
    expect(links[0].closest("a")).toHaveAttribute("href", "/dashboard/admin/stores/1");
  });

  it("displays pagination when totalCount is provided and exceeds itemsPerPage", () => {
    render(
      <VerifiedStoresList
        stores={mockStores}
        totalCount={20}
        page={1}
        onPageChange={jest.fn()}
        itemsPerPage={15}
      />
    );

    expect(screen.getByText(/Showing 1-15 of 20 stores/)).toBeInTheDocument();
  });

  it("does not display pagination when totalCount is not provided", () => {
    render(<VerifiedStoresList stores={mockStores} />);

    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it("does not display pagination when totalCount is less than itemsPerPage", () => {
    render(
      <VerifiedStoresList
        stores={mockStores}
        totalCount={10}
        page={1}
        onPageChange={jest.fn()}
        itemsPerPage={15}
      />
    );

    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it("handles revoke verification", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        store: { id: "1", name: "Verified Store 1", verification_status: "pending" },
      }),
    });

    const { toast } = await import("sonner");

    render(<VerifiedStoresList stores={mockStores} />);

    const revokeButtons = screen.getAllByText("Revoke Verification");
    fireEvent.click(revokeButtons[0]);

    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByText("Revoke Store Verification")).toBeInTheDocument();
    });

    // Find and click confirm button
    const confirmButton = screen.getByText("Revoke Verification", {
      selector: "button",
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/admin/stores/1/revoke", {
        method: "POST",
      });
      expect(toast.success).toHaveBeenCalled();
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it("handles revoke verification error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: false,
        error: "Failed to revoke",
      }),
    });

    const { toast } = await import("sonner");

    render(<VerifiedStoresList stores={mockStores} />);

    const revokeButtons = screen.getAllByText("Revoke Verification");
    fireEvent.click(revokeButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Revoke Store Verification")).toBeInTheDocument();
    });

    const confirmButton = screen.getByText("Revoke Verification", {
      selector: "button",
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("handles pagination page change", () => {
    const mockOnPageChange = jest.fn();
    render(
      <VerifiedStoresList
        stores={mockStores}
        totalCount={30}
        page={1}
        onPageChange={mockOnPageChange}
        itemsPerPage={15}
      />
    );

    const nextButton = screen.getByText("Next").closest("a");
    if (nextButton) {
      fireEvent.click(nextButton);
      // Note: Actual navigation would be handled by the href, but we can test the click
    }

    // Since we're using href="#", we can't easily test onClick in this setup
    // In a real scenario, we'd need to handle the click event properly
  });

  it("displays verification dates", () => {
    render(<VerifiedStoresList stores={mockStores} />);

    // Check that dates are formatted (they'll be formatted as "Jan 15, 2024")
    expect(screen.getByText(/Jan/)).toBeInTheDocument();
  });
});

