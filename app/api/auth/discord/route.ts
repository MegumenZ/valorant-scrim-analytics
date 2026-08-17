import { NextResponse } from "next/server";
import { generateState, generateCodeVerifier } from "arctic";
import { cookies } from "next/headers";
import { discord, isDiscordConfigured } from "@/lib/auth/discord";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // 1. Anti-Brute Force Rate Limiter Check
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, 6, 60 * 1000); // 6 attempts per minute

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: rateLimit.blocked
          ? "IP Anda diblokir sementara karena terdeteksi percobaan login berulang yang mencurigakan. Silakan coba 15 menit lagi."
          : `Terlalu banyak permintaan login. Harap tunggu ${rateLimit.resetInSeconds} detik.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.resetInSeconds),
        },
      }
    );
  }

  // Check if Discord credentials are configured
  if (!isDiscordConfigured || !discord) {
    const url = new URL("/login?error=unconfigured", request.url);
    return NextResponse.redirect(url);
  }

  // 2. Generate cryptographically secure state token (Anti-CSRF) and PKCE code verifier
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const authorizationUrl = discord.createAuthorizationURL(state, codeVerifier, ["identify", "email"]);

  // 3. Store state and code_verifier in secure HTTP-only cookie with 10 minutes expiry
  const cookieStore = await cookies();
  cookieStore.set("discord_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  });

  cookieStore.set("discord_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  });

  return NextResponse.redirect(authorizationUrl);
}
