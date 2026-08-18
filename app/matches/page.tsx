import React from "react";
import { getAllMatches } from "@/lib/actions/matches";
import { MatchHistoryClient } from "@/components/matches/match-history-client";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const matches = await getAllMatches();

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-[#1C2433] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Riwayat Scrim
          </h1>
        </div>
      </div>

      {/* Interactive Match History Client */}
      <MatchHistoryClient initialMatches={matches} />
    </div>
  );
}
