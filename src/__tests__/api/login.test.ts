import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/login/route";

const mockSignInWithPassword = jest.fn();
const mockSignInWithOtp = jest.fn();

jest.mock("@supabase/ssr", () => {
  const actual = jest.requireActual("@supabase/ssr");
  return {
    ...actual,
    createServerClient: jest.fn(() => ({
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signInWithOtp: mockSignInWithOtp,
      },
    })),
  };
});

function createRequest(body: unknown) {
  const request = new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return NextRequest.from(request);
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    mockSignInWithPassword.mockReset();
    mockSignInWithOtp.mockReset();
  });

  it("returns validation errors for incomplete payloads", async () => {
    const response = await POST(
      createRequest({
        email: "",
        password: "",
        mode: "password",
      })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.errors.fieldErrors.password[0]).toContain("Password is required");
  });

  it("signs in with password when credentials are valid", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: {
        session: {
          access_token: "access-token",
          refresh_token: "refresh-token",
          expires_at: 1700000000,
        },
        user: {
          id: "123",
          email: "user@example.com",
          user_metadata: { name: "Test User", role: "seller" },
          app_metadata: { role: "seller" },
        },
      },
      error: null,
    });

    const response = await POST(
      createRequest({
        email: "user@example.com",
        password: "CorrectHorse@123",
        rememberMe: true,
        mode: "password",
      })
    );

    expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe("user@example.com");
    expect(body.data.user.role).toBe("seller");
  });

  it("requests a magic link when mode is magic-link", async () => {
    mockSignInWithOtp.mockResolvedValueOnce({
      data: {},
      error: null,
    });

    const response = await POST(
      createRequest({
        email: "user@example.com",
        mode: "magic-link",
      })
    );

    expect(mockSignInWithOtp).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});

