import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { routing } from "./src/i18n/routing-config";

type CookieRecord = {
  name: string;
  value: string;
  options: CookieOptions;
};

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const cookiesToSet: CookieRecord[] = [];

  // Handle Supabase auth
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

  // Handle Supabase auth redirects (before locale handling)
  if (!user && pathname.match(/\/[a-z]{2}\/dashboard/)) {
    const locale = pathname.split("/")[1];
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/login`;
    redirectUrl.searchParams.set("redirectTo", pathname + request.nextUrl.search);
    return applyCookies(NextResponse.redirect(redirectUrl));
  }

  if (user && pathname.match(/\/[a-z]{2}\/login/)) {
    const locale = pathname.split("/")[1];
    const destination = new URL(`/${locale}/dashboard`, request.url);
    return applyCookies(NextResponse.redirect(destination));
  }

  // Handle locale routing with next-intl
  // This will handle:
  // - Redirecting / to /en (or stored locale)
  // - Locale detection from cookies/headers
  // - Locale prefix in URLs
  const intlResponse = intlMiddleware(request);

  // Apply Supabase cookies to intl response
  return applyCookies(intlResponse);
}

export const config = {
  // Match all pathnames except for:
  // - api routes
  // - _next (Next.js internals)
  // - static files (images, etc.)
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
    "/",
    "/([a-z]{2})?/:path*",
  ],
};
