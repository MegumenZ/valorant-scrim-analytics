import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "valo_scrim_session";
const authSecretString =
  process.env.AUTH_SECRET ||
  process.env.DISCORD_CLIENT_SECRET ||
  "valorant-scrim-analytics-secure-secret-key-32-chars";

const encodedSecret = new TextEncoder().encode(authSecretString);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Unprotected Public Routes (Login, OAuth, and Auth Endpoints)
  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/team-sc-logo");

  const token = request.cookies.get(COOKIE_NAME)?.value;

  // If user is not authenticated and is trying to access ANY private page -> Redirect to /login
  if (!token) {
    if (isPublicRoute) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If token exists, verify validity
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    const role = (payload as any).role;

    // If already logged in and visiting /login -> redirect to home
    if (pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Protected Admin-Only Routes
    const isAdminRoute =
      pathname.startsWith("/matches/new") ||
      (pathname.startsWith("/matches/") && pathname.endsWith("/edit"));

    if (isAdminRoute && role !== "ADMIN" && role !== "COACH") {
      // User is a member but not an Admin -> redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    // Invalid or expired token -> delete cookie and redirect to login
    if (isPublicRoute) {
      const response = NextResponse.next();
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
