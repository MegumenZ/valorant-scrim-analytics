import React from "react";
import { getAllPlayers, getLatestMatchPlayerIds } from "@/lib/actions/players";
import { MatchEntryForm } from "@/components/matches/match-entry-form";

export const dynamic = "force-dynamic";

export default async function NewMatchPage() {
  const [players, latestMatchPlayerIds] = await Promise.all([getAllPlayers(), getLatestMatchPlayerIds()]);

  return (
    <div className="py-2">
      <MatchEntryForm availablePlayers={players} initialPlayerIds={latestMatchPlayerIds} />
    </div>
  );
}
