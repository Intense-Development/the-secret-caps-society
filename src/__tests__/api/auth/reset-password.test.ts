import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/reset-password/route";

const mockGetUser = jest.fn();
const mockGetSession = jest.fn();
const mockUpdateUser = jest.fn();

jest.mock("@supabase/ssr", () => {
  const actual = jest.requireActual("@supabase/ssr");
  return {
    ...actual,
    createServerClient: jest.fn(() => ({
      auth: {
        getUser: mockGetUser,
        getSession: mockGetSession,
        updateUser: mockUpdateUser,
      },
    })),
  };
});

function createRequest(body: unknown, cookies: Array<{ name: string; value: string }> = []) {
  const request = new Request("http://localhost/api/auth/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies.map((c) => `${c.name}=${c.value}`).join("; "),
    },
    body: JSON.stringify(body),
  });
  return NextRequest.from(request);
}

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    mockGetUser.mockReset();
    mockGetSession.mockReset();
    mockUpdateUser.mockReset();
  });

  it("returns validation errors for invalid password format", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "123", email: "user@example.com" } },
      error: null,
    });
    mockGetSession.mockResolvedValueOnce({
      data: { session: { access_token: "token" } },
      error: null,
    });

    const response = await POST(
      createRequest({
        password: "weak",
        confirmPassword: "weak",
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Password validation failed");
    expect(body.errors).toBeDefined();
  });

  it("returns validation errors when passwords don't match", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "123", email: "user@example.com" } },
      error: null,
    });
    mockGetSession.mockResolvedValueOnce({
      data: { session: { access_token: "token" } },
      error: null,
    });

    const response = await POST(
      createRequest({
        password: "SecurePass123!",
        confirmPassword: "DifferentPass123!",
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Password validation failed");
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "Invalid token" },
    });
    mockGetSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    const response = await POST(
      createRequest({
        password: "NewSecure123!",
        confirmPassword: "NewSecure123!",
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Invalid or expired password reset link.");
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it("returns 401 when user is null", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });
    mockGetSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    const response = await POST(
      createRequest({
        password: "NewSecure123!",
        confirmPassword: "NewSecure123!",
      })
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Invalid or expired password reset link.");
  });

  it("successfully updates password when valid", async () => {
    const mockUser = { id: "123", email: "user@example.com" };
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });
    mockGetSession.mockResolvedValueOnce({
      data: { session: { access_token: "token" } },
      error: null,
    });
    mockUpdateUser.mockResolvedValueOnce({
      error: null,
    });

    const response = await POST(
      createRequest({
        password: "NewSecure123!",
        confirmPassword: "NewSecure123!",
      })
    );

    expect(mockUpdateUser).toHaveBeenCalledWith({
      password: "NewSecure123!",
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("Password updated successfully");
  });

  it("handles expired token error", async () => {
    const mockUser = { id: "123", email: "user@example.com" };
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });
    mockGetSession.mockResolvedValueOnce({
      data: { session: { access_token: "token" } },
      error: null,
    });
    mockUpdateUser.mockResolvedValueOnce({
      error: { message: "Token expired" },
    });

    const response = await POST(
      createRequest({
        password: "NewSecure123!",
        confirmPassword: "NewSecure123!",
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("expired");
  });

  it("handles same password error", async () => {
    const mockUser = { id: "123", email: "user@example.com" };
    mockGetUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });
    mockGetSession.mockResolvedValueOnce({
      data: { session: { access_token: "token" } },
      error: null,
    });
    mockUpdateUser.mockResolvedValueOnce({
      error: { message: "New password must be different from current password" },
    });

    const response = await POST(
      createRequest({
        password: "NewSecure123!",
        confirmPassword: "NewSecure123!",
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain("different from your current password");
  });

  it("handles unexpected errors gracefully", async () => {
    const request = new Request("http://localhost/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "invalid json",
    });

    const response = await POST(NextRequest.from(request));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("An unexpected error occurred. Please try again.");
  });
});

