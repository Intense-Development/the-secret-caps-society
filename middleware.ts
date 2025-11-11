import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieRecord = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const cookiesToSet: CookieRecord[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach((cookie) => cookiesToSet.push(cookie));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const applyCookies = (res: NextResponse) => {
    cookiesToSet.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options);
    });
    return res;
  };

  const { pathname } = request.nextUrl;

  if (!user && pathname.startsWith("/dashboard")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname + request.nextUrl.search);
    return applyCookies(NextResponse.redirect(redirectUrl));
  }

  if (user && pathname === "/login") {
    const destination = new URL("/dashboard", request.url);
    return applyCookies(NextResponse.redirect(destination));
  }

  return applyCookies(response);
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};

