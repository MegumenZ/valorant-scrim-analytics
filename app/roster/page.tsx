import React from "react";
import { getRosterPlayers } from "@/lib/actions/players";
import { RosterClient } from "@/components/players/roster-client";
import { LiveRefresh } from "@/components/layout/live-refresh";

export const dynamic = "force-dynamic";

export default async function RosterPage() {
  const players = await getRosterPlayers();
  const renderedAt = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).format(new Date());

  return (
    <div className="pb-12">
      <LiveRefresh renderedAt={renderedAt} />
      <RosterClient initialPlayers={players} />
    </div>
  );
}
