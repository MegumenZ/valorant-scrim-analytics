import { describe, expect, it } from "vitest";
import { resolveSessionSecret } from "@/lib/auth/session-secret";

describe("session signing secret configuration", () => {
  it("requires a dedicated strong AUTH_SECRET in production", () => {
    expect(() => resolveSessionSecret({ NODE_ENV: "production", DISCORD_CLIENT_SECRET: "another-secret-that-is-long-enough" })).toThrow(/AUTH_SECRET is required/);
    expect(() => resolveSessionSecret({ NODE_ENV: "production", AUTH_SECRET: "too-short" })).toThrow(/at least 32 characters/);
  });

  it("accepts a strong production AUTH_SECRET", () => {
    const secret = "production-session-secret-0123456789abcdef";
    expect(resolveSessionSecret({ NODE_ENV: "production", AUTH_SECRET: secret })).toBe(secret);
  });

  it("keeps a development-only fallback for local setup without exposing it in production", () => {
    expect(resolveSessionSecret({ NODE_ENV: "development" })).toMatch(/dev-only/);
  });
});
