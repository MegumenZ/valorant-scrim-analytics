"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, PlusCircle } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MapWinrateChart } from "@/components/dashboard/map-winrate-chart";
import { KdTrendChart } from "@/components/dashboard/kd-trend-chart";
import { RecentMatchesTable } from "@/components/dashboard/recent-matches-table";
import { RosterLeaderboard } from "@/components/dashboard/roster-leaderboard";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { DashboardRecentMatch } from "@/lib/actions/matches";
import { DashboardSummary } from "@/lib/utils/analytics";
import { RosterDashboardRow } from "@/lib/utils/dashboard-aggregates";
import { SMALL_SAMPLE_THRESHOLD } from "@/lib/utils/ui-constants";

type DashboardPeriod = "7d" | "30d" | "all";
interface DashboardViewProps {
  summary: DashboardSummary;
  recentMatches: DashboardRecentMatch[];
  leaderboard: RosterDashboardRow[];
  period: DashboardPeriod;
  dataDate: string;
}

export function DashboardView({ summary, recentMatches, leaderboard, period, dataDate }: DashboardViewProps) {
  const { t, language } = useTranslation();
  const isEn = language === "en";
  const roundDiff = summary.avgRoundDifference;
  const periodOptions: Array<{ key: DashboardPeriod; label: string }> = [
    { key: "7d", label: isEn ? "7 days" : "7 hari" },
    { key: "30d", label: isEn ? "30 days" : "30 hari" },
    { key: "all", label: isEn ? "All" : "Semua" },
  ];
  const periodHref = (value: DashboardPeriod) => value === "all" ? "/" : `/?period=${value}`;
  const roundDescription = roundDiff < 0
    ? (isEn ? `Narrow loss · ${Math.abs(roundDiff) < 1 ? "under 1" : Math.abs(roundDiff).toFixed(1)} round/scrim on average` : `Kalah tipis ${Math.abs(roundDiff) < 1 ? "<1" : Math.abs(roundDiff).toFixed(1)} ronde/scrim`)
    : roundDiff > 0
      ? (isEn ? `Narrow lead · ${roundDiff < 1 ? "under 1" : roundDiff.toFixed(1)} round/scrim on average` : `Menang tipis ${roundDiff < 1 ? "<1" : roundDiff.toFixed(1)} ronde/scrim`)
      : (isEn ? "Even rounds on average" : "Ronde seimbang rata-rata");

  return <div className="space-y-8 pb-12 sm:space-y-10">
    <header className="flex flex-col justify-between gap-5 border-b border-[#1C2433] pb-6 lg:flex-row lg:items-end">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-400">Team SC · Valorant Scrim Analytics</p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{isEn ? "Team Performance Summary" : "Ringkasan Performa Tim"}</h1>
        <p className="mt-1 text-sm text-[#CBD5E1]">{isEn ? "A clear view of the team's competitive practice results." : "Ringkasan hasil latihan kompetitif tim dalam satu tampilan."}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
        <div aria-label={isEn ? "Filter by period" : "Filter periode"} className="inline-flex w-fit rounded-lg border border-[#1C2433] bg-[#090C10] p-1">
          {periodOptions.map((option) => <Link key={option.key} href={periodHref(option.key)} aria-current={period === option.key ? "page" : undefined} className={`inline-flex min-h-10 items-center rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4655] ${period === option.key ? "bg-[#C92F3D] text-white" : "text-[#CBD5E1] hover:bg-[#161D28] hover:text-white"}`}>{option.label}</Link>)}
        </div>
        <p className="inline-flex items-center gap-2 whitespace-nowrap text-xs text-[#CBD5E1]"><CalendarDays aria-hidden="true" className="h-4 w-4 text-[#CBD5E1]" />{isEn ? "Data as of:" : "Data per:"} <time>{dataDate}</time></p>
      </div>
    </header>

    {summary.totalMatches === 0 ? <section className="rounded-xl border border-[#1C2433] bg-[#0C1017] p-6" aria-labelledby="empty-dashboard-title">
      <h2 id="empty-dashboard-title" className="text-lg font-semibold text-white">{period === "all" ? t.dashboard.emptyTitle : (isEn ? "No scrims in this period" : "Belum ada scrim pada periode ini")}</h2>
      {period === "all" ? <><p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">{t.dashboard.emptyDescription}</p><Link href="/matches/new" className="mt-5 inline-flex"><Button className="gap-2"><PlusCircle aria-hidden="true" className="h-4 w-4" />{isEn ? "Record a scrim" : "Catat Scrim"}</Button></Link></> : <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">{isEn ? "Try a longer period to include older match records." : "Pilih periode yang lebih panjang untuk melihat catatan pertandingan sebelumnya."}</p>}
    </section> : <>
      <section aria-label={isEn ? "Team performance metrics" : "Statistik performa tim"} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard href="#scrim-history" title={isEn ? "TOTAL SCRIMS" : "TOTAL SCRIM"} value={summary.totalMatches} subtitle={isEn ? "matches" : "pertandingan"} definition={isEn ? "Scrims are practice matches played against other teams." : "Scrim adalah pertandingan latihan yang dimainkan melawan tim lain."} />
        <KpiCard href="#scrim-history" title={isEn ? "WIN RATE" : "WIN RATE"} value={`${summary.winRate}%`} subtitle={`${summary.wins}W · ${summary.losses}L${summary.draws ? ` · ${summary.draws}D` : ""}`} variant={summary.winRate >= 50 ? "win" : "loss"} />
        <KpiCard href="#scrim-history" title={isEn ? "TEAM K/D" : "K/D TIM"} value={summary.teamKdRatio.toFixed(2)} subtitle={`${summary.teamTotalKills} ${isEn ? "Kills" : "Kill"} · ${summary.teamTotalDeaths} ${isEn ? "Deaths" : "Death"}`} definition={isEn ? "K/D compares the team's total kills with its total deaths. Above 1 means the team got more kills than deaths." : "K/D membandingkan jumlah kill tim dengan jumlah death tim. Angka di atas 1 berarti kill tim lebih banyak daripada death."} variant={summary.teamKdRatio >= 1 ? "win" : "loss"} />
        <KpiCard href="#scrim-history" title={isEn ? "AVG. ROUND DIFFERENCE" : "RATA-RATA SELISIH RONDE"} value={`${roundDiff < 0 ? "−" : roundDiff > 0 ? "+" : ""}${Math.abs(roundDiff).toFixed(1)}`} subtitle={roundDescription} definition={isEn ? "Round difference is Team SC's rounds minus the opponent's rounds in each match. A negative value means the opponent won more rounds." : "Selisih ronde adalah ronde Team SC dikurangi ronde lawan pada tiap pertandingan. Nilai negatif berarti lawan menang lebih banyak ronde."} variant={roundDiff > 0 ? "win" : roundDiff < 0 ? "loss" : "neutral"} />
      </section>

      <MapWinrateChart data={summary.mapBreakdown} />
      <section id="scrim-history" className="scroll-mt-20" aria-label={isEn ? "Scrim history" : "Riwayat Scrim"}>
        <div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-lg font-bold text-white">{isEn ? "Scrim History" : "Riwayat Scrim"}</h2><p className="mt-1 text-sm text-[#CBD5E1]">{isEn ? "Latest match results and team K/D." : "Hasil pertandingan terbaru dan perbandingan kill/death tim."}</p></div><Link href="/matches" className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-[#CBD5E1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4655]">{isEn ? "All scrims" : "Semua scrim"}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link></div>
        <RecentMatchesTable matches={recentMatches} />
        {summary.totalMatches < SMALL_SAMPLE_THRESHOLD && <p className="mt-2 text-xs text-[#CBD5E1]">{isEn ? `Showing ${recentMatches.length} of ${summary.totalMatches} scrims in this period.` : `Menampilkan ${recentMatches.length} dari ${summary.totalMatches} scrim pada periode ini.`}</p>}
      </section>
      <section aria-label={isEn ? "Detailed team analytics" : "Analitik tim terperinci"} className="grid gap-5 xl:grid-cols-2">
        <KdTrendChart data={summary.kdTrend} />
        <RosterLeaderboard leaderboard={leaderboard} totalMatches={summary.totalMatches} />
      </section>
    </>}
  </div>;
}
