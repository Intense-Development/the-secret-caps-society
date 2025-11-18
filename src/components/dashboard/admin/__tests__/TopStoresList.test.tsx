import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { TopStoresList } from "../TopStoresList";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      "admin.dashboard.topStores": "Top Stores",
      "admin.dashboard.viewStore": "View Store",
      "admin.dashboard.revenue": "Revenue",
      "admin.dashboard.orders": "Orders",
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

describe("TopStoresList", () => {
  const mockStores = [
    {
      id: "1",
      name: "Top Store 1",
      revenue: 15000,
      orders: 120,
      growth: 15.5,
    },
    {
      id: "2",
      name: "Top Store 2",
      revenue: 12000,
      orders: 95,
      growth: 8.2,
    },
  ];

  it("renders the list with stores", () => {
    render(<TopStoresList stores={mockStores} />);

    expect(screen.getByText("Top Store 1")).toBeInTheDocument();
    expect(screen.getByText("Top Store 2")).toBeInTheDocument();
  });

  it("renders revenue information", () => {
    render(<TopStoresList stores={mockStores} />);

    expect(screen.getByText(/\$15,000/)).toBeInTheDocument();
    expect(screen.getByText(/\$12,000/)).toBeInTheDocument();
  });

  it("renders order counts", () => {
    render(<TopStoresList stores={mockStores} />);

    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("95")).toBeInTheDocument();
  });

  it("renders growth percentages", () => {
    render(<TopStoresList stores={mockStores} />);

    expect(screen.getByText(/15\.5%/)).toBeInTheDocument();
    expect(screen.getByText(/8\.2%/)).toBeInTheDocument();
  });

  it("handles empty stores array", () => {
    render(<TopStoresList stores={[]} />);

    expect(screen.queryByText("Top Store 1")).not.toBeInTheDocument();
  });

  it("renders view store links", () => {
    render(<TopStoresList stores={mockStores} />);

    const links = screen.getAllByText("View Store");
    expect(links.length).toBe(2);
    expect(links[0].closest("a")).toHaveAttribute("href", "/dashboard/admin/stores/1");
  });
});

