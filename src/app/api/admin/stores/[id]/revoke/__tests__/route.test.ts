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

describe("POST /api/admin/stores/[id]/revoke", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("revokes store verification successfully", async () => {
    const mockStore = {
      id: "store-1",
      name: "Test Store",
      verification_status: "pending",
      verified_at: null,
    };

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({ data: mockStore, error: null });

    const request = new NextRequest("http://localhost/api/admin/stores/store-1/revoke", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "store-1" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.store.verification_status).toBe("pending");
    expect(data.store.verified_at).toBe(null);
    expect(mockSupabase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        verification_status: "pending",
        verified_at: null,
      })
    );
  });

  it("returns error for missing store ID", async () => {
    const request = new NextRequest("http://localhost/api/admin/stores//revoke", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "" }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Store ID is required");
  });

  it("returns error for store not found", async () => {
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({ data: null, error: null });

    const request = new NextRequest("http://localhost/api/admin/stores/invalid/revoke", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "invalid" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Store not found");
  });

  it("handles database errors gracefully", async () => {
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: { message: "Database error" },
    });

    const request = new NextRequest("http://localhost/api/admin/stores/store-1/revoke", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "store-1" }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to revoke store verification");
  });

  it("sets verification_status to pending (not rejected)", async () => {
    const mockStore = {
      id: "store-1",
      name: "Test Store",
      verification_status: "pending",
      verified_at: null,
    };

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({ data: mockStore, error: null });

    const request = new NextRequest("http://localhost/api/admin/stores/store-1/revoke", {
      method: "POST",
    });

    await POST(request, { params: Promise.resolve({ id: "store-1" }) });

    // Verify that status is set to "pending" not "rejected"
    expect(mockSupabase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        verification_status: "pending",
      })
    );
    expect(mockSupabase.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        verification_status: "rejected",
      })
    );
  });

  it("clears verified_at timestamp", async () => {
    const mockStore = {
      id: "store-1",
      name: "Test Store",
      verification_status: "pending",
      verified_at: null,
    };

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({ data: mockStore, error: null });

    const request = new NextRequest("http://localhost/api/admin/stores/store-1/revoke", {
      method: "POST",
    });

    await POST(request, { params: Promise.resolve({ id: "store-1" }) });

    expect(mockSupabase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        verified_at: null,
      })
    );
  });

  it("handles exceptions gracefully", async () => {
    mockSupabase.from.mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    const request = new NextRequest("http://localhost/api/admin/stores/store-1/revoke", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "store-1" }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Internal server error");
  });
});

