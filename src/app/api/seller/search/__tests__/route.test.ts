import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { NextRequest } from "next/server";
import { POST } from "../route";

// Mock Supabase
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  ilike: jest.fn(),
  or: jest.fn(),
  in: jest.fn(),
  limit: jest.fn(),
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

describe("POST /api/seller/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
  });

  it("returns search results for products", async () => {
    const mockProducts = [
      {
        id: "product-1",
        name: "Test Product",
        description: "A test product",
        store_id: "store-1",
      },
    ];

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.ilike.mockReturnValue(mockSupabase);
    mockSupabase.or.mockReturnValue(mockSupabase);
    mockSupabase.limit.mockResolvedValue({ data: mockProducts, error: null });

    const request = new NextRequest("http://localhost/api/seller/search", {
      method: "POST",
      body: JSON.stringify({
        query: "test",
        storeId: "store-1",
        limit: 10,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.results).toBeDefined();
    expect(Array.isArray(data.results)).toBe(true);
  });

  it("returns search results for orders", async () => {
    const mockOrderItems = [
      {
        order_id: "order-1",
        product_id: "product-1",
      },
    ];

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.in.mockReturnValue(mockSupabase);
    mockSupabase.limit.mockResolvedValue({ data: mockOrderItems, error: null });

    const request = new NextRequest("http://localhost/api/seller/search", {
      method: "POST",
      body: JSON.stringify({
        query: "order-1",
        storeId: "store-1",
        limit: 10,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.results).toBeDefined();
  });

  it("returns 401 for unauthorized user", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const request = new NextRequest("http://localhost/api/seller/search", {
      method: "POST",
      body: JSON.stringify({
        query: "test",
        storeId: "store-1",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 when query is missing", async () => {
    const request = new NextRequest("http://localhost/api/seller/search", {
      method: "POST",
      body: JSON.stringify({
        storeId: "store-1",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("returns empty results for query with no matches", async () => {
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.ilike.mockReturnValue(mockSupabase);
    mockSupabase.or.mockReturnValue(mockSupabase);
    mockSupabase.limit.mockResolvedValue({ data: [], error: null });

    const request = new NextRequest("http://localhost/api/seller/search", {
      method: "POST",
      body: JSON.stringify({
        query: "nonexistent",
        storeId: "store-1",
        limit: 10,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.results).toEqual([]);
  });
});
