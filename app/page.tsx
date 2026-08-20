import React from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { getDashboardSummary } from "@/lib/actions/matches";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MapWinrateChart } from "@/components/dashboard/map-winrate-chart";
import { AcsTrendChart } from "@/components/dashboard/acs-trend-chart";
import { TacticalWinBreakdownWidget } from "@/components/dashboard/tactical-win-breakdown";
import { RecentMatchesTable } from "@/components/dashboard/recent-matches-table";
import { RosterLeaderboard } from "@/components/dashboard/roster-leaderboard";
import { evaluateTeamTacticalHealth } from "@/lib/utils/tactical-expert-engine";
import { TeamTacticalHealthWidget } from "@/components/dashboard/team-tactical-health-widget";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { summary, recentMatches, allMatches, leaderboard } = await getDashboardSummary();
  const tacticalOverview = evaluateTeamTacticalHealth(allMatches);

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Clean Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C2433] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Dashboard Analisis Scrim
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Ringkasan performa taktis, tren efisiensi, dan evaluasi tim
          </p>
        </div>
        <div className="text-xs text-[#94A3B8] flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Roster Siap Tanding</span>
        </div>
      </div>

      {/* Empty State Welcome for New Teams */}
      {summary.totalMatches === 0 && (
        <div className="p-6 rounded-lg bg-[#0C1017] border border-[#1C2433] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">
              Platform Analitik Scrim Team SC Siap Digunakan
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Mulai rekam pertandingan latihan tim Anda untuk membuka Rapor Taktis real-time, tren efisiensi trade, dan leaderboard pemain.
            </p>
          </div>
          <Link href="/matches/new">
            <Button className="gap-2 shrink-0 font-semibold shadow-sm text-xs">
              <PlusCircle className="w-4 h-4" />
              <span>Catat Scrim Pertama</span>
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Matches */}
        <KpiCard
          title="Total Scrim Match"
          value={`${summary.totalMatches} Map`}
          subtitle={`${summary.wins} Menang · ${summary.losses} Kalah ${summary.draws > 0 ? `· ${summary.draws} Seri` : ""}`}
          variant="default"
        />

        {/* Team Win Rate */}
        <KpiCard
          title="Win Rate Tim"
          value={`${summary.winRate}%`}
          subtitle={`Attack ${summary.sideStats.attackWinRate}% · Defense ${summary.sideStats.defenseWinRate}%`}
          variant={summary.winRate >= 50 ? "win" : "loss"}
        />

        {/* Team Avg ACS */}
        <KpiCard
          title="Rata-rata ACS"
          value={`${summary.teamAvgAcs} ACS`}
          subtitle="Rata-rata performa 5 pemain"
          variant="highlight"
        />

        {/* Team Trade Efficiency */}
        <KpiCard
          title="Efisiensi Trade"
          value={`${summary.tradingStats?.tradeEfficiency || 0}%`}
          subtitle={`${summary.tradingStats?.tradedDeaths || 0} Di-trade · ${summary.tradingStats?.totalDeaths || 0} Deaths`}
          variant={(summary.tradingStats?.tradeEfficiency || 0) >= 60 ? "win" : (summary.tradingStats?.tradeEfficiency || 0) >= 45 ? "trade" : "loss"}
        />
      </div>

      {/* Team Collective Tactical Health & Coach Priorities Widget */}
      <TeamTacticalHealthWidget overview={tacticalOverview} />

      {/* Tactical Win & Loss Conditions and Trading Kills Breakdown + Latest Scrim Sequence */}
      <TacticalWinBreakdownWidget
        winData={summary.tacticalWins}
        lossData={summary.tacticalLosses}
        tradingStats={summary.tradingStats}
        latestMatch={recentMatches[0]}
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
