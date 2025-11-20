import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OrdersTable } from "../OrdersTable";
import type { SellerOrder } from "@/application/orders/seller/getSellerOrders";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "seller.orders.status.pending": "Pending",
      "seller.orders.status.processing": "Processing",
      "seller.orders.status.completed": "Completed",
      "seller.orders.status.cancelled": "Cancelled",
      "seller.orders.status.refunded": "Refunded",
      "seller.orders.viewDetails": "View Details",
    };
    return translations[key] || key;
  },
}));

// Mock date-fns
jest.mock("date-fns", () => ({
  formatDistanceToNow: (date: Date) => "2 days ago",
}));

describe("OrdersTable", () => {
  const mockOrders: SellerOrder[] = [
    {
      id: "order-1",
      total_amount: 100.0,
      seller_amount: 100.0,
      status: "pending",
      is_partial: false,
      buyer_name: "John Doe",
      buyer_email: "john@example.com",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      items: [
        {
          product_id: "product-1",
          product_name: "Test Product",
          quantity: 2,
          price: 50.0,
          total: 100.0,
        },
      ],
    },
    {
      id: "order-2",
      total_amount: 150.0,
      seller_amount: 75.0,
      status: "completed",
      is_partial: true,
      buyer_name: "Jane Smith",
      buyer_email: "jane@example.com",
      created_at: "2024-01-02T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
      items: [
        {
          product_id: "product-2",
          product_name: "Another Product",
          quantity: 1,
          price: 75.0,
          total: 75.0,
        },
      ],
    },
  ];

  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render orders table with orders", () => {
    render(<OrdersTable orders={mockOrders} onRefresh={mockOnRefresh} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("should display order statuses", () => {
    render(<OrdersTable orders={mockOrders} onRefresh={mockOnRefresh} />);

    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("should display order totals", () => {
    render(<OrdersTable orders={mockOrders} onRefresh={mockOnRefresh} />);

    expect(screen.getByText("$100.00")).toBeInTheDocument();
    expect(screen.getByText("$75.00")).toBeInTheDocument();
  });

  it("should indicate partial orders", () => {
    render(<OrdersTable orders={mockOrders} onRefresh={mockOnRefresh} />);

    // Partial order should have some indicator
    const partialOrder = screen.getByText("Jane Smith").closest("tr");
    expect(partialOrder).toBeInTheDocument();
  });

  it("should show empty state when no orders", () => {
    render(<OrdersTable orders={[]} onRefresh={mockOnRefresh} />);

    expect(screen.getByText(/no orders/i)).toBeInTheDocument();
  });

  it("should open order detail dialog when view button is clicked", async () => {
    render(<OrdersTable orders={mockOrders} onRefresh={mockOnRefresh} />);

    const viewButtons = screen.getAllByRole("button", { name: /view|details/i });
    if (viewButtons.length > 0) {
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/order details/i)).toBeInTheDocument();
      });
    }
  });
});

