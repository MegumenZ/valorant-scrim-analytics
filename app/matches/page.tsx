import React from "react";
import { getAllMatches } from "@/lib/actions/matches";
import { MatchHistoryClient } from "@/components/matches/match-history-client";
import { LiveRefresh } from "@/components/layout/live-refresh";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const matches = await getAllMatches();
  const renderedAt = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).format(new Date());

  return (
    <div className="pb-12 select-none">
      <LiveRefresh renderedAt={renderedAt} />
      <MatchHistoryClient initialMatches={matches} />
    </div>
  );
}
