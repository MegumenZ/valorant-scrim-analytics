import React from "react";
import { getAllPlayers } from "@/lib/actions/players";
import { RosterClient } from "@/components/players/roster-client";

export const dynamic = "force-dynamic";

export default async function RosterPage() {
  const players = await getAllPlayers();

  return (
    <div className="pb-12">
      <RosterClient initialPlayers={players} />
    </div>
  );
}
