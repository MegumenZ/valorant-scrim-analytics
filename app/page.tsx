import React from "react";
import { Swords, Trophy, Target, Zap } from "lucide-react";
import { getDashboardSummary } from "@/lib/actions/matches";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MapWinrateChart } from "@/components/dashboard/map-winrate-chart";
import { AcsTrendChart } from "@/components/dashboard/acs-trend-chart";
import { TacticalWinBreakdownWidget } from "@/components/dashboard/tactical-win-breakdown";
import { RecentMatchesTable } from "@/components/dashboard/recent-matches-table";
import { RosterLeaderboard } from "@/components/dashboard/roster-leaderboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { summary, recentMatches, leaderboard } = await getDashboardSummary();

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-[#1C2433] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Dashboard Scrim
          </h1>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Matches */}
        <KpiCard
          title="Total Scrim Match"
          value={`${summary.totalMatches} Map`}
          subtitle={`${summary.wins} Menang - ${summary.losses} Kalah ${summary.draws > 0 ? `(${summary.draws} Seri)` : ""}`}
          detail="Total game tanding"
          icon={Swords}
          variant="default"
        />

        {/* Team Win Rate */}
        <KpiCard
          title="Win Rate Tim"
          value={`${summary.winRate}%`}
          subtitle={`Attack: ${summary.sideStats.attackWinRate}% | Def: ${summary.sideStats.defenseWinRate}%`}
          detail="Berdasarkan sisi awal"
          icon={Trophy}
          variant={summary.winRate >= 50 ? "win" : "loss"}
        />

        {/* Team Avg ACS */}
        <KpiCard
          title="Rata-rata Combat Score"
          value={`${summary.teamAvgAcs} ACS`}
          subtitle={`Avg ADR: ${summary.teamAvgAdr}`}
          detail="Damage output tim per round"
          icon={Zap}
          variant="highlight"
        />

        {/* Strongest Map */}
        <KpiCard
          title="Map Terkuat"
          value={summary.totalMatches > 0 ? summary.strongestMap.map : "Belum Ada Data"}
          subtitle={summary.totalMatches > 0 ? `${summary.strongestMap.winRate}% Win Rate` : "Catat match pertama"}
          detail={summary.totalMatches > 0 ? `${summary.strongestMap.wins} Menang - ${summary.strongestMap.losses} Kalah` : "Belum ada scrim"}
          icon={Target}
          variant="amber"
        />
      </div>

      {/* Tactical Win Conditions, Trading Kills & Round Duration Breakdown */}
      <TacticalWinBreakdownWidget
        data={summary.tacticalWins}
        tradingStats={summary.tradingStats}
        pacingStats={summary.pacingStats}
      />

      {/* Dual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MapWinrateChart data={summary.mapBreakdown} />
        <AcsTrendChart data={summary.acsTrend} />
      </div>

      {/* Recent Scrim Matches Log */}
      <RecentMatchesTable matches={recentMatches} />

      {/* Season Roster Leaderboard */}
      <RosterLeaderboard leaderboard={leaderboard} />
    </div>
  );
}
