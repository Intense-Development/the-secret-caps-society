import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { PendingStoresList } from "../PendingStoresList";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      "admin.dashboard.pendingStores": "Pending Stores",
      "admin.dashboard.viewDetails": "View Details",
      "admin.dashboard.approve": "Approve",
      "admin.dashboard.reject": "Reject",
    };
    return translations[key] || key;
  }),
}));

// Mock Link
jest.mock("@/i18n/routing-config", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("PendingStoresList", () => {
  const mockStores = [
    {
      id: "1",
      name: "Test Store 1",
      owner: "John Doe",
      submittedAt: new Date("2024-01-15"),
      category: "Baseball Caps",
    },
    {
      id: "2",
      name: "Test Store 2",
      owner: "Jane Smith",
      submittedAt: new Date("2024-01-14"),
      category: "Snapbacks",
    },
  ];

  it("renders the list with stores", () => {
    render(<PendingStoresList stores={mockStores} />);

    expect(screen.getByText("Test Store 1")).toBeInTheDocument();
    expect(screen.getByText("Test Store 2")).toBeInTheDocument();
  });

  it("renders store owner names", () => {
    render(<PendingStoresList stores={mockStores} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    render(<PendingStoresList stores={mockStores} />);

    const approveButtons = screen.getAllByText("Approve");
    const rejectButtons = screen.getAllByText("Reject");
    expect(approveButtons.length).toBe(2);
    expect(rejectButtons.length).toBe(2);
  });

  it("handles empty stores array", () => {
    render(<PendingStoresList stores={[]} />);

    expect(screen.queryByText("Test Store 1")).not.toBeInTheDocument();
  });

  it("renders view details links", () => {
    render(<PendingStoresList stores={mockStores} />);

    const links = screen.getAllByText("View Details");
    expect(links.length).toBe(2);
    expect(links[0].closest("a")).toHaveAttribute("href", "/dashboard/admin/stores/1");
  });
});

