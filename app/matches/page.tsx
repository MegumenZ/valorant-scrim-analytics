import React from "react";
import { getAllMatches } from "@/lib/actions/matches";
import { MatchHistoryClient } from "@/components/matches/match-history-client";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const matches = await getAllMatches();

  return (
    <div className="pb-12 select-none">
      <MatchHistoryClient initialMatches={matches} />
    </div>
  );
}
