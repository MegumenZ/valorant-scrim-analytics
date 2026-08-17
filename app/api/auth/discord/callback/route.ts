import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { discord, isDiscordConfigured, DiscordUser, getDiscordAvatarUrl } from "@/lib/auth/discord";
import { createSessionCookie, determineUserRole } from "@/lib/auth/session";
import { checkRateLimit, getClientIp } from "@/lib/auth/rate-limit";
import { db, ensureDbInitialized } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // 1. Anti-Brute Force Rate Limiter
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, 10, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.redirect(
      new URL("/login?error=rate_limited", request.url)
    );
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("discord_oauth_state")?.value;
  const storedCodeVerifier = cookieStore.get("discord_code_verifier")?.value;

  // Clear state and verifier cookies
  cookieStore.delete("discord_oauth_state");
  cookieStore.delete("discord_code_verifier");

  // 2. Anti-CSRF Validation
  if (!code || !state || !storedState || state !== storedState || !storedCodeVerifier) {
    console.warn(`[OAuth Security Alert] State mismatch detected from IP: ${clientIp}`);
    return NextResponse.redirect(
      new URL("/login?error=state_mismatch", request.url)
    );
  }

  if (!isDiscordConfigured || !discord) {
    return NextResponse.redirect(
      new URL("/login?error=unconfigured", request.url)
    );
  }

  try {
    // 3. Exchange authorization code with PKCE verifier for Discord access token
    const tokens = await discord.validateAuthorizationCode(code, storedCodeVerifier);
    const accessToken = tokens.accessToken();

    // 4. Fetch user profile from Discord REST API
    const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch Discord user: ${userResponse.statusText}`);
    }

    const discordUser: DiscordUser = await userResponse.json();
    const avatarUrl = getDiscordAvatarUrl(discordUser.id, discordUser.avatar);

    await ensureDbInitialized();

    // 5. Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.discordId, discordUser.id),
    });

    const calculatedRole = determineUserRole(
      discordUser.id,
      existingUser?.role
    );

    let finalUser;

    if (existingUser) {
      // Update profile
      await db
        .update(users)
        .set({
          username: discordUser.username,
          globalName: discordUser.global_name || discordUser.username,
          avatar: avatarUrl,
          role: calculatedRole,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(users.id, existingUser.id));

      finalUser = {
        ...existingUser,
        username: discordUser.username,
        globalName: discordUser.global_name || discordUser.username,
        avatar: avatarUrl,
        role: calculatedRole,
      };
    } else {
      // Insert new user
      const newId = crypto.randomUUID();
      await db.insert(users).values({
        id: newId,
        discordId: discordUser.id,
        username: discordUser.username,
        globalName: discordUser.global_name || discordUser.username,
        avatar: avatarUrl,
        role: calculatedRole,
      });

      finalUser = {
        id: newId,
        discordId: discordUser.id,
        username: discordUser.username,
        globalName: discordUser.global_name || discordUser.username,
        avatar: avatarUrl,
        role: calculatedRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // 6. Create encrypted Session Cookie
    await createSessionCookie(finalUser);

    // Redirect to Dashboard
    return NextResponse.redirect(new URL("/", request.url));
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(err.message || "oauth_failed")}`, request.url)
    );
  }
}
