import { describe, it, expect } from "vitest";
import { getDiscordAvatarUrl } from "@/lib/auth/discord";

describe("Discord Avatar URL Generation", () => {
  it("should return custom animated avatar URL when avatarHash starts with a_", () => {
    const url = getDiscordAvatarUrl("123456789", "a_abcd123456", 256);
    expect(url).toBe("https://cdn.discordapp.com/avatars/123456789/a_abcd123456.gif?size=256");
  });

  it("should return custom static png avatar URL when avatarHash is provided", () => {
    const url = getDiscordAvatarUrl("123456789", "static_hash_123", 128);
    expect(url).toBe("https://cdn.discordapp.com/avatars/123456789/static_hash_123.png?size=128");
  });

  it("should return default embed avatar index for valid numeric discordId", () => {
    const url = getDiscordAvatarUrl("156108187895048192");
    expect(url).toMatch(/https:\/\/cdn\.discordapp\.com\/embed\/avatars\/[0-5]\.png/);
  });

  it("should gracefully handle non-numeric or malformed discordId without throwing SyntaxError", () => {
    expect(() => getDiscordAvatarUrl("invalid-id-demo")).not.toThrow();
    const url = getDiscordAvatarUrl("demo_user");
    expect(url).toBe("https://cdn.discordapp.com/embed/avatars/0.png");
  });
});
