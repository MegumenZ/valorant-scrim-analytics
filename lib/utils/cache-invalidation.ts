import { updateTag } from "next/cache";

/**
 * Match views include player labels/status and player views include match stats,
 * so both shared domains must expire after either kind of mutation.
 */
export function invalidateScrimReadCache() {
  updateTag("matches");
  updateTag("players");
}
