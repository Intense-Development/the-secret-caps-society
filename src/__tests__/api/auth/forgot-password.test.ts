import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/forgot-password/route";

const mockResetPasswordForEmail = jest.fn();

jest.mock("@supabase/ssr", () => {
  const actual = jest.requireActual("@supabase/ssr");
  return {
    ...actual,
    createServerClient: jest.fn(() => ({
      auth: {
        resetPasswordForEmail: mockResetPasswordForEmail,
      },
    })),
  };
});

function createRequest(body: unknown) {
  const request = new Request("http://localhost/api/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return NextRequest.from(request);
}

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    mockResetPasswordForEmail.mockReset();
  });

  it("returns validation errors for invalid email format", async () => {
    const response = await POST(
      createRequest({
        email: "invalid-email",
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Invalid email format");
    expect(body.errors).toBeDefined();
  });

  it("returns validation errors for missing email", async () => {
    const response = await POST(createRequest({}));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Invalid email format");
  });

  it("returns success message even when email doesn't exist (email enumeration protection)", async () => {
    mockResetPasswordForEmail.mockResolvedValueOnce({
      error: { message: "User not found", status: 404 },
    });

    const response = await POST(
      createRequest({
        email: "nonexistent@example.com",
      })
    );

    expect(mockResetPasswordForEmail).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("If an account exists with that email");
  });

  it("returns success message when email exists", async () => {
    mockResetPasswordForEmail.mockResolvedValueOnce({
      error: null,
    });

    const response = await POST(
      createRequest({
        email: "user@example.com",
      })
    );

    expect(mockResetPasswordForEmail).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("If an account exists with that email");
  });

  it("uses NEXT_PUBLIC_APP_URL when provided", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com";
    mockResetPasswordForEmail.mockResolvedValueOnce({
      error: null,
    });

    await POST(
      createRequest({
        email: "user@example.com",
      })
    );

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      "user@example.com",
      expect.objectContaining({
        redirectTo: expect.stringContaining("https://example.com"),
      })
    );
  });

  it("uses request origin as fallback when NEXT_PUBLIC_APP_URL is not set", async () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    mockResetPasswordForEmail.mockResolvedValueOnce({
      error: null,
    });

    await POST(
      createRequest({
        email: "user@example.com",
      })
    );

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      "user@example.com",
      expect.objectContaining({
        redirectTo: expect.stringContaining("localhost"),
      })
    );
  });

  it("handles unexpected errors gracefully", async () => {
    // Mock JSON parsing to throw
    const request = new Request("http://localhost/api/auth/forgot-password", {
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

