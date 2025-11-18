import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { NextRequest } from "next/server";
import { GET } from "../route";

// Mock Supabase
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
};

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => mockSupabase),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

describe("GET /api/admin/stores/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns store details successfully", async () => {
    const mockStore = {
      id: "store-1",
      name: "Test Store",
      owner_id: "user-1",
      verification_status: "pending",
    };

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({ data: mockStore, error: null });

    const request = new NextRequest("http://localhost/api/admin/stores/store-1");

    const response = await GET(request, { params: { id: "store-1" } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.store).toEqual(mockStore);
  });

  it("returns error for invalid store ID", async () => {
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: "Not found" } });

    const request = new NextRequest("http://localhost/api/admin/stores/invalid");

    const response = await GET(request, { params: { id: "invalid" } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });
});

