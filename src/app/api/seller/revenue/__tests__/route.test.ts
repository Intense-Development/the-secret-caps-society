import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { NextRequest } from "next/server";
import { GET } from "../route";

// Mock Supabase
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  in: jest.fn(),
  gte: jest.fn(),
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

describe("GET /api/seller/revenue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
  });

  it("returns revenue data successfully", async () => {
    const mockStore = { id: "store-1" };
    const mockProducts = [{ id: "product-1" }];
    const mockOrderItems = [
      {
        order_id: "order-1",
        product_id: "product-1",
        quantity: 2,
        price: 50.0,
      },
    ];
    const mockOrders = [
      {
        id: "order-1",
        total_amount: 100.0,
        status: "completed",
        created_at: new Date().toISOString(),
      },
    ];

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({ data: mockStore, error: null });
    mockSupabase.in.mockResolvedValueOnce({ data: mockProducts, error: null });
    mockSupabase.in.mockResolvedValueOnce({ data: mockOrderItems, error: null });
    mockSupabase.gte.mockResolvedValue({ data: mockOrders, error: null });

    const request = new NextRequest("http://localhost/api/seller/revenue?storeId=store-1&period=30d");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.overview).toBeDefined();
    expect(data.trend).toBeDefined();
  });

  it("returns 401 for unauthorized user", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const request = new NextRequest("http://localhost/api/seller/revenue?storeId=store-1");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 when storeId is missing", async () => {
    const request = new NextRequest("http://localhost/api/seller/revenue");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Store ID required");
  });

  it("uses default period when not specified", async () => {
    const mockStore = { id: "store-1" };
    const mockProducts = [{ id: "product-1" }];

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({ data: mockStore, error: null });
    mockSupabase.in.mockResolvedValue({ data: mockProducts, error: null });

    const request = new NextRequest("http://localhost/api/seller/revenue?storeId=store-1");

    const response = await GET(request);

    expect(response.status).toBe(200);
  });
});

