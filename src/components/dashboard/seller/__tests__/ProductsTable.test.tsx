import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductsTable } from "../ProductsTable";
import type { SellerProduct } from "@/application/products/seller/getSellerProducts";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "seller.products.delete.title": "Are you sure?",
      "seller.products.delete.description": "This action cannot be undone.",
      "seller.products.delete.confirm": "Delete",
      "seller.products.delete.cancel": "Cancel",
    };
    return translations[key] || key;
  },
}));

describe("ProductsTable", () => {
  const mockProducts: SellerProduct[] = [
    {
      id: "1",
      name: "Test Product 1",
      price: 29.99,
      stock: 10,
      category: "Snapbacks",
      store_id: "store-1",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "Test Product 2",
      price: 39.99,
      stock: 5,
      category: "Fitted",
      store_id: "store-1",
      created_at: "2024-01-02T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
    },
  ];

  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render products table with products", () => {
    render(
      <ProductsTable
        products={mockProducts}
        storeId="store-1"
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText("Test Product 2")).toBeInTheDocument();
    expect(screen.getByText("$29.99")).toBeInTheDocument();
    expect(screen.getByText("$39.99")).toBeInTheDocument();
  });

  it("should display stock counts", () => {
    render(
      <ProductsTable
        products={mockProducts}
        storeId="store-1"
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("should display categories", () => {
    render(
      <ProductsTable
        products={mockProducts}
        storeId="store-1"
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText("Snapbacks")).toBeInTheDocument();
    expect(screen.getByText("Fitted")).toBeInTheDocument();
  });

  it("should show empty state when no products", () => {
    render(
      <ProductsTable
        products={[]}
        storeId="store-1"
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText(/no products/i)).toBeInTheDocument();
  });

  it("should call onRefresh when product is deleted", async () => {
    // Mock fetch for delete
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <ProductsTable
        products={mockProducts}
        storeId="store-1"
        onRefresh={mockOnRefresh}
      />
    );

    // Find delete button (usually in a dropdown menu)
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);

      // Confirm deletion in dialog
      await waitFor(() => {
        const confirmButton = screen.getByRole("button", { name: /delete|confirm/i });
        if (confirmButton) {
          fireEvent.click(confirmButton);
        }
      });

      // onRefresh should be called after successful deletion
      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalled();
      });
    }
  });

  it("should highlight product when highlightedProductId is provided", () => {
    render(
      <ProductsTable
        products={mockProducts}
        storeId="store-1"
        onRefresh={mockOnRefresh}
        highlightedProductId="1"
      />
    );

    const productRow = screen.getByText("Test Product 1").closest("tr");
    expect(productRow).toHaveAttribute("id", "product-1");
  });
});

