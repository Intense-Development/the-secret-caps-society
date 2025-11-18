import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { NextRequest } from "next/server";
import { POST } from "../route";

// Mock Supabase
const mockSupabase = {
  from: jest.fn(),
  update: jest.fn(),
  eq: jest.fn(),
  select: jest.fn(),
  single: jest.fn(),
};

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => mockSupabase),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";

describe("POST /api/admin/stores/[id]/reject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects a store successfully", async () => {
    const mockStore = {
      id: "store-1",
      verification_status: "rejected",
    };

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({ data: mockStore, error: null });

    const request = new NextRequest("http://localhost/api/admin/stores/store-1/reject", {
      method: "POST",
      body: JSON.stringify({ reason: "Invalid documents" }),
    });

    const response = await POST(request, { params: { id: "store-1" } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.store.verification_status).toBe("rejected");
    expect(mockSupabase.update).toHaveBeenCalled();
  });

  it("returns error for invalid store ID", async () => {
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: "Not found" } });

    const request = new NextRequest("http://localhost/api/admin/stores/invalid/reject", {
      method: "POST",
      body: JSON.stringify({ reason: "Test" }),
    });

    const response = await POST(request, { params: { id: "invalid" } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });
});

