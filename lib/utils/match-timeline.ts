import { RoundItem } from "@/lib/validations/match";

/** Preserve historical round and trade detail when the new scoreboard form omits it. */
export function resolveRoundTimelineForUpdate(submitted: RoundItem[] | null | undefined, existing: string | null): string | null {
  if (submitted == null) return existing;
  return submitted.length > 0 ? JSON.stringify(submitted) : null;
}
