"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, PlusCircle } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MapWinrateChart } from "@/components/dashboard/map-winrate-chart";
import { KdTrendChart } from "@/components/dashboard/kd-trend-chart";
import { RecentMatchesTable } from "@/components/dashboard/recent-matches-table";
import { RosterLeaderboard } from "@/components/dashboard/roster-leaderboard";
import { TeamSnapshot } from "@/components/dashboard/team-snapshot";
import { Button } from "@/components/ui/button";
import { DashboardRecentMatch } from "@/lib/actions/matches";
import { DashboardSummary } from "@/lib/utils/analytics";
import { RosterDashboardRow } from "@/lib/utils/dashboard-aggregates";

type DashboardPeriod = "7d" | "30d" | "all";

interface DashboardViewProps {
  summary: DashboardSummary;
  recentMatches: DashboardRecentMatch[];
  leaderboard: RosterDashboardRow[];
  period: DashboardPeriod;
  dataDate: string;
}

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  "7d": "7 hari",
  "30d": "30 hari",
  all: "Semua",
};

export function DashboardView({
  summary,
  recentMatches,
  leaderboard,
  period,
  dataDate,
}: DashboardViewProps) {
  const hasData = summary.totalMatches > 0;

  return (
    <div className="space-y-6 pb-12 sm:space-y-8">
      <DashboardHeader period={period} dataDate={dataDate} />

      {!hasData ? (
        <EmptyState period={period} />
      ) : (
        <>
          <KpiRow summary={summary} />

          <TeamSnapshot summary={summary} />

          <section
            aria-label="Analitik tim"
            className="grid gap-5 xl:grid-cols-2"
          >
            <KdTrendChart data={summary.kdTrend} />
            <MapWinrateChart data={summary.mapBreakdown} />
          </section>

          <section id="scrim-history" className="scroll-mt-20 space-y-4">
            <SectionHeading
              title="Scrim Terbaru"
              description="Hasil pertandingan terbaru dan perbandingan kill/death tim."
              action={{ href: "/matches", label: "Lihat semua" }}
            />
            <RecentMatchesTable matches={recentMatches} />
          </section>

          <section aria-label="Peringkat pemain">
            <RosterLeaderboard
              leaderboard={leaderboard}
              totalMatches={summary.totalMatches}
            />
          </section>
        </>
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function DashboardHeader({
  period,
  dataDate,
}: {
  period: DashboardPeriod;
  dataDate: string;
}) {
  return (
    <header className="flex flex-col justify-between gap-4 border-b border-[#1C2433] pb-6 lg:flex-row lg:items-end">
      <div className="min-w-0">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF4655]">
          Team SC · Valorant Scrim Analytics
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Performa Tim
        </h1>
        <p className="mt-1 text-sm text-[#CBD5E1]">
          Ringkasan hasil latihan kompetitif tim dalam satu tampilan.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <PeriodFilter period={period} />
        <p className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-[#94A3B8]">
          <CalendarDays aria-hidden="true" className="h-4 w-4" />
          Data per <time>{dataDate}</time>
        </p>
      </div>
    </header>
  );
}

function PeriodFilter({ period }: { period: DashboardPeriod }) {
  return (
    <div
      role="group"
      aria-label="Filter periode"
      className="inline-flex w-fit rounded-lg border border-[#1C2433] bg-[#090C10] p-1"
    >
      {(Object.keys(PERIOD_LABELS) as DashboardPeriod[]).map((key) => {
        const active = period === key;
        return (
          <Link
            key={key}
            href={key === "all" ? "/" : `/?period=${key}`}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-10 items-center rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4655] ${
              active
                ? "bg-[#C92F3D] text-white"
                : "text-[#CBD5E1] hover:bg-[#161D28] hover:text-white"
            }`}
          >
            {PERIOD_LABELS[key]}
          </Link>
        );
      })}
    </div>
  );
}

function KpiRow({ summary }: { summary: DashboardSummary }) {
  const roundDiff = summary.avgRoundDifference;

  return (
    <section
      aria-label="Statistik performa tim"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <KpiCard
        href="#scrim-history"
        label="Total Scrim"
        value={summary.totalMatches}
        subtitle="Pertandingan latihan yang sudah dimainkan."
        definition="Scrim adalah pertandingan latihan melawan tim lain."
      />
      <KpiCard
        href="#scrim-history"
        label="Win Rate"
        value={`${summary.winRate}%`}
        subtitle={`${summary.wins} menang · ${summary.losses} kalah${
          summary.draws ? ` · ${summary.draws} seri` : ""
        }`}
        definition="Persentase scrim yang dimenangkan; seri tidak dihitung menang maupun kalah."
        variant={summary.winRate >= 50 ? "win" : "loss"}
      />
      <KpiCard
        href="#scrim-history"
        label="K/D Tim"
        value={summary.teamKdRatio.toFixed(2)}
        subtitle={`${summary.teamTotalKills} kill · ${summary.teamTotalDeaths} death`}
        definition="Total kill dibagi total death. Di atas 1,00 berarti kill tim lebih banyak daripada death."
        variant={summary.teamKdRatio >= 1 ? "win" : "loss"}
      />
      <KpiCard
        href="#scrim-history"
        label="Selisih Ronde"
        value={formatRoundDiff(roundDiff)}
        subtitle={describeRoundDiff(roundDiff)}
        definition="Rata-rata ronde Team SC dikurangi ronde lawan per scrim."
        variant={roundDiff > 0 ? "win" : roundDiff < 0 ? "loss" : "neutral"}
      />
    </section>
  );
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="mt-1 text-sm text-[#CBD5E1]">{description}</p>
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 text-xs font-semibold text-[#CBD5E1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4655]"
        >
          {action.label}
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function EmptyState({ period }: { period: DashboardPeriod }) {
  const isAll = period === "all";
  return (
    <section
      aria-labelledby="empty-dashboard-title"
      className="rounded-xl border border-[#1C2433] bg-[#0C1017] p-8 text-center"
    >
      <h2
        id="empty-dashboard-title"
        className="text-lg font-semibold text-white"
      >
        {isAll
          ? "Belum ada scrim tercatat"
          : "Belum ada scrim pada periode ini"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#CBD5E1]">
        {isAll
          ? "Catat scrim pertama untuk mulai melacak kemenangan, map, dan performa pemain."
          : "Pilih periode yang lebih panjang untuk melihat catatan pertandingan sebelumnya."}
      </p>
      {isAll && (
        <Link href="/matches/new" className="mt-5 inline-flex">
          <Button className="gap-2">
            <PlusCircle aria-hidden="true" className="h-4 w-4" />
            Catat Scrim
          </Button>
        </Link>
      )}
    </section>
  );
}

/* ---------- Helpers ---------- */

function formatRoundDiff(diff: number): string {
  if (diff === 0) return "0,0";
  const sign = diff > 0 ? "+" : "−";
  return `${sign}${Math.abs(diff).toFixed(1)}`;
}

function describeRoundDiff(diff: number): string {
  if (diff === 0) return "Ronde seimbang rata-rata.";
  const magnitude =
    Math.abs(diff) < 1 ? "di bawah 1" : Math.abs(diff).toFixed(1);
  const direction = diff > 0 ? "unggul" : "tertinggal";
  return `${magnitude} ronde ${direction} per scrim.`;
}
