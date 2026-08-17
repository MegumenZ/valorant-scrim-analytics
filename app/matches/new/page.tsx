import React from "react";
import { getAllPlayers } from "@/lib/actions/players";
import { MatchEntryForm } from "@/components/matches/match-entry-form";

export const dynamic = "force-dynamic";

export default async function NewMatchPage() {
  const players = await getAllPlayers();

  return (
    <div className="py-2">
      <MatchEntryForm availablePlayers={players} />
    </div>
  );
}
