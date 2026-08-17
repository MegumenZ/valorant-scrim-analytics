import React from "react";
import Link from "next/link";
import { Swords, Trophy, Target, Zap, PlusCircle } from "lucide-react";
import { getDashboardSummary } from "@/lib/actions/matches";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MapWinrateChart } from "@/components/dashboard/map-winrate-chart";
import { AcsTrendChart } from "@/components/dashboard/acs-trend-chart";
import { RecentMatchesTable } from "@/components/dashboard/recent-matches-table";
import { RosterLeaderboard } from "@/components/dashboard/roster-leaderboard";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { summary, recentMatches, leaderboard } = await getDashboardSummary();

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242e40] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100">
              Dashboard Analitik Tim
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Musim Berjalan
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rekapitulasi performa scrimmage tim, efisiensi map, dan tren combat score.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/matches/new">
            <Button size="sm" className="gap-1.5 font-bold shadow-md shadow-rose-950/40">
              <PlusCircle className="w-4 h-4" />
              <span>+ Catat Match Baru</span>
            </Button>
          </Link>
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
          value={summary.strongestMap.map}
          subtitle={`${summary.strongestMap.winRate}% Win Rate`}
          detail={`${summary.strongestMap.wins} Menang - ${summary.strongestMap.losses} Kalah`}
          icon={Target}
          variant="amber"
        />
      </div>

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
