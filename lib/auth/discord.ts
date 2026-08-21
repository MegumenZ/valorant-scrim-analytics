import { Discord } from "arctic";

const clientId = process.env.DISCORD_CLIENT_ID || "";
const clientSecret = process.env.DISCORD_CLIENT_SECRET || "";
const redirectUri =
  process.env.DISCORD_REDIRECT_URI ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api/auth/discord/callback`
    : "http://localhost:3000/api/auth/discord/callback");

export const isDiscordConfigured = Boolean(clientId && clientSecret);

export const discord = isDiscordConfigured
  ? new Discord(clientId, clientSecret, redirectUri)
  : null;

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar?: string | null;
  email?: string | null;
  verified?: boolean;
}

/**
 * Get avatar URL for a Discord user with safe BigInt fallback
 */
export function getDiscordAvatarUrl(
  discordId: string,
  avatarHash?: string | null,
  size: number = 128
): string {
  if (avatarHash) {
    const isAnimated = avatarHash.startsWith("a_");
    const ext = isAnimated ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.${ext}?size=${size}`;
  }
  
  // Safe default discord avatar calculation based on user ID modulo 6
  let defaultIndex = 0n;
  try {
    if (discordId && /^\d+$/.test(discordId)) {
      defaultIndex = (BigInt(discordId) >> 22n) % 6n;
    }
  } catch {
    defaultIndex = 0n;
  }

  return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
}
