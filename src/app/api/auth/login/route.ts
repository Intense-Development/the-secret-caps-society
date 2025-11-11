import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { loginSchema } from "@/lib/validations/auth";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

const REMEMBER_ME_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

function buildErrorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      message,
      details,
    },
    { status }
  );
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();
    const validationResult = loginSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { email, password, mode, rememberMe } = validationResult.data;

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

    if (mode === "magic-link") {
      const redirectUrl =
        process.env.NEXT_PUBLIC_APP_URL ??
        `${request.nextUrl.origin}/login?status=magic-link`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return buildErrorResponse(
          mapSupabaseError(error.message),
          error.status ?? 400
        );
      }

      return NextResponse.json({
        success: true,
        message: "Magic link sent. Check your email to continue.",
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password ?? "",
    });

    if (error || !data.session || !data.user) {
      return buildErrorResponse(
        mapSupabaseError(error?.message ?? "Invalid credentials"),
        error?.status ?? 401
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Successfully logged in",
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name ?? data.user.email,
          role: (data.user.user_metadata?.role ??
            data.user.app_metadata?.role ??
            "buyer") as string,
        },
        session: {
          expiresAt: data.session.expires_at ?? null,
        },
      },
    });

    cookiesToSet.forEach(({ name, value, options }) => {
      const cookieOptions: CookieOptions = { ...options };
      if (rememberMe) {
        cookieOptions.maxAge = REMEMBER_ME_MAX_AGE_SECONDS;
        cookieOptions.expires = new Date(
          Date.now() + REMEMBER_ME_MAX_AGE_SECONDS * 1000
        );
      } else {
        delete cookieOptions.maxAge;
        delete cookieOptions.expires;
      }
      response.cookies.set(name, value, cookieOptions);
    });

    response.cookies.set("sb-remember-me", rememberMe ? "1" : "0", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: true,
      maxAge: REMEMBER_ME_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return buildErrorResponse("Internal server error", 500);
  }
}

function mapSupabaseError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Please verify your email before logging in.";
  }

  if (normalized.includes("suspended")) {
    return "Your account is currently suspended. Contact support for assistance.";
  }

  return message;
}
