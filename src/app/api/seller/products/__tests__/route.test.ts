import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { NextRequest } from "next/server";
import { GET, POST } from "../route";

// Mock Supabase
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
  insert: jest.fn(),
  order: jest.fn(),
  auth: {
    getUser: jest.fn(),
  },
};

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

describe("GET /api/seller/products", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
  });

  it("returns products for seller's store successfully", async () => {
    const mockStore = { id: "store-1" };
    const mockProducts = [
      {
        id: "product-1",
        name: "Test Product",
        price: 29.99,
        stock: 10,
        store_id: "store-1",
      },
    ];

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({ data: mockStore, error: null });
    mockSupabase.order.mockResolvedValue({ data: mockProducts, error: null });

    const request = new NextRequest("http://localhost/api/seller/products?storeId=store-1");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.products).toBeDefined();
    expect(data.products).toHaveLength(1);
  });

  it("returns 401 for unauthorized user", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const request = new NextRequest("http://localhost/api/seller/products?storeId=store-1");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 when storeId is missing", async () => {
    const request = new NextRequest("http://localhost/api/seller/products");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Store ID required");
  });

  it("returns 403 when store doesn't belong to user", async () => {
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: "Not found" } });

    const request = new NextRequest("http://localhost/api/seller/products?storeId=store-1");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Store not found or access denied");
  });
});

describe("POST /api/seller/products", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
  });

  it("creates product successfully", async () => {
    const mockStore = { id: "store-1" };
    const mockProduct = {
      id: "product-1",
      name: "New Product",
      price: 29.99,
      stock: 10,
      store_id: "store-1",
    };

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({ data: mockStore, error: null });
    mockSupabase.insert.mockResolvedValue({ data: [mockProduct], error: null });

    const request = new NextRequest("http://localhost/api/seller/products", {
      method: "POST",
      body: JSON.stringify({
        name: "New Product",
        price: 29.99,
        stock: 10,
        storeId: "store-1",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.product).toBeDefined();
    expect(data.product.name).toBe("New Product");
  });

  it("returns 400 for invalid product data", async () => {
    const request = new NextRequest("http://localhost/api/seller/products", {
      method: "POST",
      body: JSON.stringify({
        name: "", // Invalid: empty name
        price: -10, // Invalid: negative price
        storeId: "store-1",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});

