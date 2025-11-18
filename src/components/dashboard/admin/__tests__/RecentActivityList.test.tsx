import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { RecentActivityList } from "../RecentActivityList";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      "admin.dashboard.recentActivity": "Recent Activity",
      "admin.dashboard.storeCreated": "Store created",
      "admin.dashboard.orderPlaced": "Order placed",
      "admin.dashboard.userRegistered": "User registered",
    };
    return translations[key] || key;
  }),
}));

// Mock date-fns format
jest.mock("date-fns", () => ({
  format: jest.fn((date: Date, format: string) => {
    return date.toLocaleDateString();
  }),
}));

describe("RecentActivityList", () => {
  const mockActivities = [
    {
      id: "1",
      type: "store_created",
      description: "New store 'Test Store' was created",
      user: "John Doe",
      timestamp: new Date("2024-01-15T10:00:00"),
    },
    {
      id: "2",
      type: "order_placed",
      description: "Order #1234 was placed",
      user: "Jane Smith",
      timestamp: new Date("2024-01-15T09:30:00"),
    },
  ];

  it("renders the list with activities", () => {
    render(<RecentActivityList activities={mockActivities} />);

    expect(screen.getByText(/New store 'Test Store' was created/)).toBeInTheDocument();
    expect(screen.getByText(/Order #1234 was placed/)).toBeInTheDocument();
  });

  it("renders user names", () => {
    render(<RecentActivityList activities={mockActivities} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("renders timestamps", () => {
    render(<RecentActivityList activities={mockActivities} />);

    // Timestamps should be rendered (format is mocked)
    const timestamps = screen.getAllByText(/2024/);
    expect(timestamps.length).toBeGreaterThan(0);
  });

  it("handles empty activities array", () => {
    render(<RecentActivityList activities={[]} />);

    expect(screen.queryByText(/New store/)).not.toBeInTheDocument();
  });

  it("renders activity icons", () => {
    render(<RecentActivityList activities={mockActivities} />);

    // Icons should be present (lucide-react icons are rendered as SVGs)
    const icons = document.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
  });
});

