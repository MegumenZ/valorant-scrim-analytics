import React from "react";
import { Swords, Trophy, Target, Zap } from "lucide-react";
import { getDashboardSummary } from "@/lib/actions/matches";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MapWinrateChart } from "@/components/dashboard/map-winrate-chart";
import { AcsTrendChart } from "@/components/dashboard/acs-trend-chart";
import { TacticalWinBreakdownWidget } from "@/components/dashboard/tactical-win-breakdown";
import { RecentMatchesTable } from "@/components/dashboard/recent-matches-table";
import { RosterLeaderboard } from "@/components/dashboard/roster-leaderboard";
import { evaluateTeamTacticalHealth } from "@/lib/utils/tactical-expert-engine";
import { TeamTacticalHealthWidget } from "@/components/dashboard/team-tactical-health-widget";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { summary, recentMatches, allMatches, leaderboard } = await getDashboardSummary();
  const tacticalOverview = evaluateTeamTacticalHealth(allMatches);

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

        {/* Team Trade Efficiency */}
        <KpiCard
          title="Efisiensi Trade Tim"
          value={`${summary.tradingStats?.tradeEfficiency || 0}% Trade`}
          subtitle={`${summary.tradingStats?.tradedDeaths || 0} Di-trade / ${summary.tradingStats?.totalDeaths || 0} Deaths`}
          detail="Disiplin spacing & refrag"
          icon={Swords}
          variant={(summary.tradingStats?.tradeEfficiency || 0) >= 60 ? "win" : (summary.tradingStats?.tradeEfficiency || 0) >= 45 ? "amber" : "loss"}
        />
      </div>

      {/* Team Collective Tactical Health & Coach Priorities Widget */}
      <TeamTacticalHealthWidget overview={tacticalOverview} />

      {/* Tactical Win & Loss Conditions and Trading Kills Breakdown */}
      <TacticalWinBreakdownWidget
        winData={summary.tacticalWins}
        lossData={summary.tacticalLosses}
        tradingStats={summary.tradingStats}
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
