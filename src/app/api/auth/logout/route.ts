import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

function buildSuccessResponse(message: string) {
  return NextResponse.json(
    {
      success: true,
      message,
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const cookiesToSet: CookieToSet[] = [];
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookies) => {
            cookies.forEach((cookie) => cookiesToSet.push(cookie));
          },
        },
      }
    );

    // Attempt to sign out from Supabase
    // This is idempotent - safe to call even if already logged out
    const { error } = await supabase.auth.signOut();

    // Always return success from user perspective (graceful degradation)
    // Even if Supabase fails, we'll clear cookies client-side
    const response = buildSuccessResponse(
      "Successfully logged out"
    );

    // Clear all Supabase auth cookies by setting them with Max-Age=0
    cookiesToSet.forEach(({ name, options }) => {
      response.cookies.set(name, "", {
        ...options,
        maxAge: 0,
        expires: new Date(0),
        path: "/",
      });
    });

    // Clear sb-remember-me cookie
    response.cookies.set("sb-remember-me", "", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: true,
      maxAge: 0,
      expires: new Date(0),
    });

    // Log error server-side but don't expose it to client
    if (error) {
      console.error("Logout API error (non-critical):", error.message);
    }

    return response;
  } catch (error) {
    // Even on unexpected errors, return success and clear cookies
    console.error("Logout API unexpected error:", error);
    
    const response = buildSuccessResponse(
      "Successfully logged out"
    );

    // Clear cookies even on error
    response.cookies.set("sb-remember-me", "", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: true,
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  }
}

