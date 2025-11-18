import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { NextRequest } from "next/server";
import { POST } from "../route";

// Mock Supabase
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  ilike: jest.fn(),
  or: jest.fn(),
  eq: jest.fn(),
  limit: jest.fn(),
};

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => mockSupabase),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

describe("POST /api/admin/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns search results for stores", async () => {
    const mockStores = [
      { id: "1", name: "Test Store", owner_id: "user-1" },
      { id: "2", name: "Another Store", owner_id: "user-2" },
    ];

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.ilike.mockReturnValue(mockSupabase);
    mockSupabase.or.mockReturnValue(mockSupabase);
    mockSupabase.limit.mockResolvedValue({ data: mockStores, error: null });

    const request = new NextRequest("http://localhost/api/admin/search", {
      method: "POST",
      body: JSON.stringify({ query: "test", type: "stores" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.results).toBeDefined();
  });

  it("returns search results for products", async () => {
    const mockProducts = [
      { id: "1", name: "Test Product", store_id: "store-1" },
    ];

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.ilike.mockReturnValue(mockSupabase);
    mockSupabase.or.mockReturnValue(mockSupabase);
    mockSupabase.limit.mockResolvedValue({ data: mockProducts, error: null });

    const request = new NextRequest("http://localhost/api/admin/search", {
      method: "POST",
      body: JSON.stringify({ query: "product", type: "products" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.results).toBeDefined();
  });

  it("returns search results for users", async () => {
    const mockUsers = [
      { id: "1", email: "test@example.com", name: "Test User" },
    ];

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.ilike.mockReturnValue(mockSupabase);
    mockSupabase.or.mockReturnValue(mockSupabase);
    mockSupabase.limit.mockResolvedValue({ data: mockUsers, error: null });

    const request = new NextRequest("http://localhost/api/admin/search", {
      method: "POST",
      body: JSON.stringify({ query: "test", type: "users" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.results).toBeDefined();
  });

  it("returns error for invalid request body", async () => {
    const request = new NextRequest("http://localhost/api/admin/search", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it("returns error for missing query", async () => {
    const request = new NextRequest("http://localhost/api/admin/search", {
      method: "POST",
      body: JSON.stringify({ type: "stores" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("handles database errors gracefully", async () => {
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.ilike.mockReturnValue(mockSupabase);
    mockSupabase.or.mockReturnValue(mockSupabase);
    mockSupabase.limit.mockResolvedValue({
      data: null,
      error: { message: "Database error" },
    });

    const request = new NextRequest("http://localhost/api/admin/search", {
      method: "POST",
      body: JSON.stringify({ query: "test", type: "stores" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });
});

