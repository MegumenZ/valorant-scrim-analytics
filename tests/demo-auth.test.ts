import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSessionCookie: vi.fn(),
  ensureDbInitialized: vi.fn(),
  findFirst: vi.fn(),
  insert: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  createSessionCookie: mocks.createSessionCookie,
  DEMO_ADMIN_DISCORD_ID: "100000000000000001",
  DEMO_MEMBER_DISCORD_ID: "100000000000000002",
}));
vi.mock("@/lib/db", () => ({
  db: { query: { users: { findFirst: mocks.findFirst } }, insert: mocks.insert },
  ensureDbInitialized: mocks.ensureDbInitialized,
}));
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, eq: vi.fn(() => ({})) };
});

import { GET } from "@/app/api/auth/demo/route";

describe("demo authentication route", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("rejects demo login in production even if the legacy opt-in flag is true", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ENABLE_DEMO_LOGIN", "true");

    const response = await GET(new Request("https://scrims.example/api/auth/demo?role=ADMIN"));

    expect(response.status).toBe(403);
    expect(mocks.ensureDbInitialized).not.toHaveBeenCalled();
    expect(mocks.createSessionCookie).not.toHaveBeenCalled();
  });
});
