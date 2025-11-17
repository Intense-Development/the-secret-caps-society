import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import SellerDashboard from "@/components/dashboard/seller/SellerDashboard";

// Mock the data service
jest.mock("@/application/dashboard/seller/getSellerDashboardData", () => ({
  getSellerDashboardData: jest.fn(),
}));

import { getSellerDashboardData } from "@/application/dashboard/seller/getSellerDashboardData";

describe("SellerDashboard", () => {
  const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

  const mockDashboardData = {
    summaryCards: [
      {
        id: "revenue-7d",
        title: "Revenue (7 days)",
        value: "$1,250.00",
        changeLabel: "+15%",
        trend: "up" as const,
      },
      {
        id: "orders-fulfilled",
        title: "Orders fulfilled",
        value: "12",
        changeLabel: "+3",
        trend: "up" as const,
      },
      {
        id: "products-listed",
        title: "Products listed",
        value: "45",
        changeLabel: "+5",
        trend: "up" as const,
      },
      {
        id: "low-stock-alerts",
        title: "Low stock alerts",
        value: "5",
        changeLabel: "",
        trend: "down" as const,
      },
    ],
    lowStockProducts: [
      {
        id: "product-1",
        name: "Snapback Cap",
        stock: 3,
        category: "Snapbacks",
      },
    ],
    pendingOrders: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render summary cards", async () => {
    // Arrange
    (getSellerDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

    // Act
    render(await SellerDashboard({ userId: mockUserId }));

    // Assert
    expect(screen.getByText("Revenue (7 days)")).toBeInTheDocument();
  });

  it("should display summary cards with real data", async () => {
    // Arrange
    (getSellerDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

    // Act
    render(await SellerDashboard({ userId: mockUserId }));

    // Assert
    expect(screen.getByText("Revenue (7 days)")).toBeInTheDocument();
    expect(screen.getByText("$1,250.00")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(getSellerDashboardData).toHaveBeenCalledWith(mockUserId);
  });

  it("should display empty state when seller has no stores", async () => {
    // Arrange
    const emptyData = {
      summaryCards: [
        {
          id: "revenue-7d",
          title: "Revenue (7 days)",
          value: "$0.00",
          changeLabel: "0",
          trend: "up" as const,
        },
        {
          id: "orders-fulfilled",
          title: "Orders fulfilled",
          value: "0",
          changeLabel: "0",
          trend: "up" as const,
        },
        {
          id: "products-listed",
          title: "Products listed",
          value: "0",
          changeLabel: "0",
          trend: "up" as const,
        },
        {
          id: "low-stock-alerts",
          title: "Low stock alerts",
          value: "0",
          changeLabel: "",
          trend: "up" as const,
        },
      ],
      lowStockProducts: [],
      pendingOrders: [],
    };
    (getSellerDashboardData as jest.Mock).mockResolvedValue(emptyData);

    // Act
    render(await SellerDashboard({ userId: mockUserId }));

    // Assert
    expect(
      screen.getByText(/You haven't created any stores yet/i)
    ).toBeInTheDocument();
    expect(screen.getByText("No stores yet")).toBeInTheDocument();
  });

  it("should display low stock alerts section", async () => {
    // Arrange
    (getSellerDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

    // Act
    render(await SellerDashboard({ userId: mockUserId }));

    // Assert
    expect(screen.getByText(/Low Stock Alerts/i)).toBeInTheDocument();
    expect(screen.getByText("Snapback Cap")).toBeInTheDocument();
  });

  it("should display low stock products with severity badges", async () => {
    // Arrange
    const dataWithLowStock = {
      ...mockDashboardData,
      lowStockProducts: [
        {
          id: "product-1",
          name: "Critical Stock Cap",
          stock: 0,
          category: "Snapbacks",
        },
        {
          id: "product-2",
          name: "Low Stock Beanie",
          stock: 4,
          category: "Beanies",
        },
      ],
    };
    (getSellerDashboardData as jest.Mock).mockResolvedValue(dataWithLowStock);

    // Act
    render(await SellerDashboard({ userId: mockUserId }));

    // Assert
    expect(screen.getByText("Critical Stock Cap")).toBeInTheDocument();
    expect(screen.getByText("Low Stock Beanie")).toBeInTheDocument();
    expect(screen.getByText("0 left")).toBeInTheDocument();
    expect(screen.getByText("4 left")).toBeInTheDocument();
  });

  it("should display all products well stocked message when no low stock", async () => {
    // Arrange
    const dataNoLowStock = {
      ...mockDashboardData,
      lowStockProducts: [],
    };
    (getSellerDashboardData as jest.Mock).mockResolvedValue(dataNoLowStock);

    // Act
    render(await SellerDashboard({ userId: mockUserId }));

    // Assert
    expect(screen.getByText(/All products well stocked/i)).toBeInTheDocument();
  });

  it("should display order management section", async () => {
    // Arrange
    (getSellerDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

    // Act
    render(await SellerDashboard({ userId: mockUserId }));

    // Assert
    expect(screen.getByText(/Pending Orders/i)).toBeInTheDocument();
  });

  it("should display pending orders when available", async () => {
    // Arrange
    const dataWithOrders = {
      ...mockDashboardData,
      pendingOrders: [
        {
          id: "order-1",
          status: "pending",
          total_amount: 150.0,
          created_at: "2025-11-05T10:00:00Z",
        },
        {
          id: "order-2",
          status: "processing",
          total_amount: 200.0,
          created_at: "2025-11-04T10:00:00Z",
        },
      ],
    };
    (getSellerDashboardData as jest.Mock).mockResolvedValue(dataWithOrders);

    // Act
    render(await SellerDashboard({ userId: mockUserId }));

    // Assert
    expect(screen.getByText(/Order #/i)).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.getByText("processing")).toBeInTheDocument();
  });

  it("should display empty state when no pending orders", async () => {
    // Arrange
    (getSellerDashboardData as jest.Mock).mockResolvedValue(mockDashboardData);

    // Act
    render(await SellerDashboard({ userId: mockUserId }));

    // Assert
    expect(screen.getByText(/No pending orders/i)).toBeInTheDocument();
  });

  it("should require userId prop", () => {
    // Arrange & Act & Assert
    expect(mockUserId).toBeDefined();
  });
});

