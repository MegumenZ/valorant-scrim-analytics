import { NextResponse } from "next/server";
import { createSessionCookie } from "@/lib/auth/session";
import { db, ensureDbInitialized } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Strict security check: Demo login is disabled in production
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEMO_LOGIN !== "true") {
    return NextResponse.json(
      { error: "Demo login dinonaktifkan pada lingkungan production demi keamanan." },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const roleParam = url.searchParams.get("role") === "MEMBER" ? "MEMBER" : "ADMIN";
  const discordId = roleParam === "ADMIN" ? "100000000000000001" : "100000000000000002";
  const username = roleParam === "ADMIN" ? "f0rsakeN (Demo Admin/IGL)" : "mindfreak (Demo Member)";

  await ensureDbInitialized();

  let user = await db.query.users.findFirst({
    where: eq(users.discordId, discordId),
  });

  if (!user) {
    const id = crypto.randomUUID();
    await db.insert(users).values({
      id,
      discordId,
      username,
      globalName: username,
      avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
      role: roleParam,
    });

    user = {
      id,
      discordId,
      username,
      globalName: username,
      avatar: "https://cdn.discordapp.com/embed/avatars/0.png",
      role: roleParam,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } else {
    await db
      .update(users)
      .set({ role: roleParam })
      .where(eq(users.id, user.id));
    user.role = roleParam;
  }

  await createSessionCookie(user);
  return NextResponse.redirect(new URL("/", request.url));
}
