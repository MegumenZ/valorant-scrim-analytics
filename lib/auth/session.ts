import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db, ensureDbInitialized } from "../db";
import { users, User } from "../db/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "valo_scrim_session";
const SESSION_EXPIRATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Encryption secret from AUTH_SECRET or auto-generated fallback
const authSecretString =
  process.env.AUTH_SECRET ||
  process.env.DISCORD_CLIENT_SECRET ||
  "valorant-scrim-analytics-secure-secret-key-32-chars";

const encodedSecret = new TextEncoder().encode(authSecretString);

export interface SessionPayload {
  userId: string;
  discordId: string;
  username: string;
  globalName?: string | null;
  avatar?: string | null;
  role: "ADMIN" | "COACH" | "MEMBER";
  exp?: number;
}

/**
 * Determine user role based on DISCORD_ADMIN_IDS whitelist or database record
 */
export function determineUserRole(discordId: string, currentRole?: string): "ADMIN" | "COACH" | "MEMBER" {
  const adminIds = (process.env.DISCORD_ADMIN_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (adminIds.includes(discordId)) {
    return "ADMIN";
  }

  if (currentRole === "ADMIN" || currentRole === "COACH" || currentRole === "MEMBER") {
    return currentRole;
  }

  return "MEMBER";
}

/**
 * Create a secure encrypted JWT and set the HTTP-only session cookie
 */
export async function createSessionCookie(user: User): Promise<string> {
  const payload: SessionPayload = {
    userId: user.id,
    discordId: user.discordId,
    username: user.username,
    globalName: user.globalName,
    avatar: user.avatar,
    role: user.role,
  };

  const jwt = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRATION_SECONDS}s`)
    .sign(encodedSecret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRATION_SECONDS,
  });

  return jwt;
}

/**
 * Verify JWT token string and return decoded session payload
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Get current authenticated user from session cookie
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload || !payload.userId) return null;

    await ensureDbInitialized();
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    return user || null;
  } catch (err) {
    console.error("Error retrieving current user session:", err);
    return null;
  }
}

/**
 * Clear session cookie to log out user
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
