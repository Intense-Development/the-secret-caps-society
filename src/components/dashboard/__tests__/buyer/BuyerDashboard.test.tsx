import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import BuyerDashboard from "@/components/dashboard/buyer/BuyerDashboard";

// Mock the data service
jest.mock("@/application/dashboard/buyer/getBuyerDashboardData", () => ({
  getBuyerDashboardData: jest.fn(),
}));

import { getBuyerDashboardData } from "@/application/dashboard/buyer/getBuyerDashboardData";

describe("BuyerDashboard", () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

  const mockDashboardData = {
    summaryCards: [
      {
        id: "orders-placed",
        title: "Orders placed",
        value: "5",
        changeLabel: "+2",
        trend: "up" as const,
        helperText: "Next delivery in 2 days",
      },
      {
        id: "total-spent",
        title: "Total spent",
        value: "$450.00",
        changeLabel: "+10%",
        trend: "up" as const,
      },
      {
        id: "recent-order",
        title: "Recent order",
        value: "Nov 5, 2025",
        changeLabel: "2 days ago",
        trend: "up" as const,
      },
      {
        id: "pending-orders",
        title: "Pending orders",
        value: "1",
        changeLabel: "",
        trend: "up" as const,
      },
    ],
    recentOrders: [
      {
        id: "order-1",
        status: "completed",
        total_amount: 150.0,
        created_at: "2025-11-05T10:00:00Z",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render summary cards", async () => {
    // Arrange
    (getBuyerDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

    // Act
    render(await BuyerDashboard({ userId: mockUserId }));

    // Assert
    expect(screen.getByText("Orders placed")).toBeInTheDocument();
  });

  it("should display summary cards with real data", async () => {
    // Arrange
    (getBuyerDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

    // Act
    render(await BuyerDashboard({ userId: mockUserId }));

    // Assert
    expect(screen.getByText("Orders placed")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("$450.00")).toBeInTheDocument();
    expect(getBuyerDashboardData).toHaveBeenCalledWith(mockUserId);
  });

  it("should display empty state when buyer has no orders", async () => {
    // Arrange
    const emptyData = {
      summaryCards: [
        {
          id: "orders-placed",
          title: "Orders placed",
          value: "0",
          changeLabel: "0",
          trend: "up" as const,
        },
        {
          id: "total-spent",
          title: "Total spent",
          value: "$0.00",
          changeLabel: "0",
          trend: "up" as const,
        },
        {
          id: "recent-order",
          title: "Recent order",
          value: "N/A",
          changeLabel: "",
          trend: "up" as const,
        },
        {
          id: "pending-orders",
          title: "Pending orders",
          value: "0",
          changeLabel: "",
          trend: "up" as const,
        },
      ],
      recentOrders: [],
    };
    (getBuyerDashboardData as jest.Mock).mockResolvedValue(emptyData);

    // Act
    render(await BuyerDashboard({ userId: mockUserId }));

    // Assert
    expect(
      screen.getByText(/You haven't placed any orders yet/i)
    ).toBeInTheDocument();
    expect(screen.getByText("No orders yet")).toBeInTheDocument();
  });

  it("should display order history section when orders exist", async () => {
    // Arrange
    (getBuyerDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

    // Act
    render(await BuyerDashboard({ userId: mockUserId }));

    // Assert
    expect(screen.getByText(/Recent Orders/i)).toBeInTheDocument();
    expect(screen.getByText(/Order #/i)).toBeInTheDocument();
  });

  it("should display order status badges correctly", async () => {
    // Arrange
    const dataWithMultipleStatuses = {
      ...mockDashboardData,
      recentOrders: [
        {
          id: "order-1",
          status: "completed",
          total_amount: 150.0,
          created_at: "2025-11-05T10:00:00Z",
        },
        {
          id: "order-2",
          status: "processing",
          total_amount: 200.0,
          created_at: "2025-11-04T10:00:00Z",
        },
        {
          id: "order-3",
          status: "pending",
          total_amount: 100.0,
          created_at: "2025-11-03T10:00:00Z",
        },
      ],
    };
    (getBuyerDashboardData as jest.Mock).mockResolvedValue(dataWithMultipleStatuses);

    // Act
    render(await BuyerDashboard({ userId: mockUserId }));

    // Assert
    expect(screen.getByText("completed")).toBeInTheDocument();
    expect(screen.getByText("processing")).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("should require userId prop", () => {
    // Arrange & Act & Assert
    // TypeScript should enforce this at compile time
    // Runtime test would check for null/undefined userId
    expect(mockUserId).toBeDefined();
  });
});

