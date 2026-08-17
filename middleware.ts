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

  // Protected Admin Routes that require ADMIN role
  const isAdminRoute =
    pathname.startsWith("/matches/new") ||
    (pathname.startsWith("/matches/") && pathname.endsWith("/edit"));

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    const role = (payload as any).role;

    if (role !== "ADMIN" && role !== "COACH") {
      // User is logged in but doesn't have ADMIN permissions
      const homeUrl = new URL("/", request.url);
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
  } catch (err) {
    // Invalid or expired token -> redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
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
