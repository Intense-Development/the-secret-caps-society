import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/logout/route";

const mockSignOut = jest.fn();

jest.mock("@supabase/ssr", () => {
  const actual = jest.requireActual("@supabase/ssr");
  return {
    ...actual,
    createServerClient: jest.fn(() => ({
      auth: {
        signOut: mockSignOut,
      },
    })),
  };
});

function createRequest(cookies: Record<string, string> = {}) {
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

  const request = new Request("http://localhost/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
  });
  return NextRequest.from(request);
}

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    mockSignOut.mockReset();
  });

  it("successfully logs out and clears cookies", async () => {
    mockSignOut.mockResolvedValueOnce({
      error: null,
    });

    const response = await POST(
      createRequest({
        "sb-access-token": "token",
        "sb-refresh-token": "refresh",
        "sb-remember-me": "1",
      })
    );

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("logged out");

    // Check that cookies are cleared
    const setCookieHeaders = response.headers.getSetCookie();
    expect(setCookieHeaders.length).toBeGreaterThan(0);

    // Check that sb-remember-me is cleared
    const rememberMeCookie = setCookieHeaders.find((cookie) =>
      cookie.includes("sb-remember-me")
    );
    expect(rememberMeCookie).toBeDefined();
    expect(rememberMeCookie).toContain("Max-Age=0");
  });

  it("is idempotent - can be called multiple times safely", async () => {
    mockSignOut.mockResolvedValueOnce({
      error: null,
    });

    const response1 = await POST(createRequest());
    const response2 = await POST(createRequest());

    expect(mockSignOut).toHaveBeenCalledTimes(2);
    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    const body1 = await response1.json();
    const body2 = await response2.json();
    expect(body1.success).toBe(true);
    expect(body2.success).toBe(true);
  });

  it("returns success even if Supabase signOut fails (graceful degradation)", async () => {
    mockSignOut.mockResolvedValueOnce({
      error: { message: "Network error" },
    });

    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);

    // Cookies should still be cleared even if Supabase fails
    const setCookieHeaders = response.headers.getSetCookie();
    expect(setCookieHeaders.length).toBeGreaterThan(0);
  });

  it("clears all Supabase auth cookies", async () => {
    mockSignOut.mockResolvedValueOnce({
      error: null,
    });

    const response = await POST(
      createRequest({
        "sb-access-token": "token",
        "sb-refresh-token": "refresh",
        "sb-remember-me": "1",
      })
    );

    const setCookieHeaders = response.headers.getSetCookie();
    const cookieNames = setCookieHeaders.map((cookie) =>
      cookie.split("=")[0].trim()
    );

    // Should clear sb-remember-me
    expect(cookieNames.some((name) => name.includes("sb-remember-me"))).toBe(
      true
    );
  });

  it("works when called without any cookies (already logged out)", async () => {
    mockSignOut.mockResolvedValueOnce({
      error: null,
    });

    const response = await POST(createRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});

