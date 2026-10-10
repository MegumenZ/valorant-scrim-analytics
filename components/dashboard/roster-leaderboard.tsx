"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { RosterDashboardRow } from "@/lib/utils/dashboard-aggregates";
import { getRosterStatusLabel } from "@/lib/utils/roster-behavior";
import { SMALL_SAMPLE_THRESHOLD } from "@/lib/utils/ui-constants";

function metricValue(total: number | null, average: number | null, samples: number, sampleLabel: string) {
  if (total == null || average == null) return <span className="text-[#CBD5E1]">—</span>;
  return <span className="tabular-nums text-white">{total} <span className="text-[#CBD5E1]">({average.toFixed(1)}/m)</span><small className="mt-0.5 block text-[11px] leading-snug text-[#CBD5E1]">{samples} {sampleLabel}</small></span>;
}

export function RosterLeaderboard({ leaderboard, totalMatches }: { leaderboard: RosterDashboardRow[]; totalMatches: number }) {
  const { t, language } = useTranslation();
  const isEn = language === "en";
  const status = (active: boolean) => !active && <span className="ml-2 rounded border border-[#2A364F] px-1.5 py-0.5 text-[11px] text-[#CBD5E1]">{getRosterStatusLabel(false, isEn ? "en" : "id")}</span>;
  const sampleBadge = (count: number) => count < SMALL_SAMPLE_THRESHOLD && <span className="mt-1 inline-flex rounded border border-[#2A364F] bg-[#141A24] px-1.5 py-0.5 text-[11px] text-[#CBD5E1]">{isEn ? `Data from ${count} scrims` : `Data dari ${count} scrim`}</span>;
  const playerSummary = (matches: number, kdRatio: number) => <span className="text-xs font-normal text-[#CBD5E1]">{matches} {isEn ? "games" : "game"} · K/D {kdRatio.toFixed(2)}</span>;

  return <Card className="overflow-hidden border-[#1C2433] bg-[#0C1017] shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-[#1C2433] bg-[#090C10] px-4 py-4 sm:px-5"><div><CardTitle className="text-sm font-bold text-white sm:text-base">{t.dashboard.leaderboardTitle}</CardTitle><p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">{t.dashboard.leaderboardSubtitle}</p></div><Link href="/roster"><Button variant="outline" size="sm" className="h-9 shrink-0 gap-1.5 px-2.5 text-xs">{isEn ? "Manage roster" : "Kelola roster"}<ChevronRight aria-hidden="true" className="h-3.5 w-3.5" /></Button></Link></CardHeader>
    <CardContent className="p-0">
      <div className="divide-y divide-[#1C2433] xl:hidden">
        {leaderboard.length ? leaderboard.map((item, index) => <Link key={item.player.id} href={`/players/${item.player.id}`} className="block space-y-3 px-4 py-4 transition-colors hover:bg-[#141A24]">
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><span className="font-semibold text-white">{index + 1}. {item.player.name}</span>{status(item.player.isActive)}<span className="mt-0.5 block text-xs text-[#CBD5E1]">{item.player.primaryRole}</span><span className="mt-1 block">{playerSummary(item.matches, item.kdRatio)}</span></div><span className="shrink-0 text-right font-tactical text-lg font-bold tabular-nums text-white">{item.kdRatio.toFixed(2)}<small className="ml-1 text-xs">K/D</small>{sampleBadge(item.matches)}</span></div>
          <p className="text-xs text-[#CBD5E1]">{item.matches}/{totalMatches} {t.dashboard.scrims} · {isEn ? "Avg per scrim" : "Rata-rata per scrim"}: <span className="text-white tabular-nums">{item.avgKills.toFixed(1)} K · {item.avgDeaths.toFixed(1)} D · {item.avgAssists.toFixed(1)} A</span></p>
          <div className="grid grid-cols-1 gap-2 border-t border-[#1C2433] pt-2 sm:grid-cols-3"><div><span className="mb-1 block text-[11px] text-[#CBD5E1]">{t.dashboard.firstBlood}</span>{metricValue(item.firstBloodTotal,item.firstBloodAverage,item.firstBloodSamples,t.dashboard.samples)}</div><div><span className="mb-1 block text-[11px] text-[#CBD5E1]">{t.dashboard.plants}</span>{metricValue(item.plantsTotal,item.plantsAverage,item.plantsSamples,t.dashboard.samples)}</div><div><span className="mb-1 block text-[11px] text-[#CBD5E1]">{t.dashboard.defuses}</span>{metricValue(item.defusesTotal,item.defusesAverage,item.defusesSamples,t.dashboard.samples)}</div></div>
        </Link>) : <p className="p-5 text-center text-[#CBD5E1]">{isEn ? "No player performance data available." : "Belum ada data pemain."}</p>}
      </div>
      <div className="hidden overflow-x-auto xl:block"><table className="w-full border-collapse text-left text-sm"><thead><tr className="border-b border-[#1C2433] bg-[#090C10] text-xs font-semibold text-[#CBD5E1]"><th className="px-3 py-3 text-center">#</th><th className="px-3 py-3">{t.dashboard.player}</th><th className="px-3 py-3">{t.dashboard.role}</th><th className="px-3 py-3 text-center">{t.dashboard.scrims}</th><th className="px-3 py-3 text-center">K/D</th><th className="px-3 py-3 text-center">{t.dashboard.averageKills}</th><th className="px-3 py-3 text-center">{t.dashboard.averageDeaths}</th><th className="px-3 py-3 text-center">{t.dashboard.averageAssists}</th><th className="px-3 py-3 text-center">{t.dashboard.firstBlood}</th><th className="px-3 py-3 text-center">{t.dashboard.plants}</th><th className="px-3 py-3 text-center">{t.dashboard.defuses}</th></tr></thead><tbody className="divide-y divide-[#1C2433]">{leaderboard.length ? leaderboard.map((item,index) => <tr key={item.player.id} className="hover:bg-[#141A24]"><td className="px-3 py-3 text-center text-[#CBD5E1]">{index + 1}</td><td className="px-3 py-3"><div className="flex flex-col items-start gap-1"><div className="flex items-center gap-1"><Link href={`/players/${item.player.id}`} className="font-semibold text-white hover:text-[#FF7A84]">{item.player.name}</Link>{status(item.player.isActive)}</div>{playerSummary(item.matches, item.kdRatio)}</div></td><td className="px-3 py-3 text-[#CBD5E1]">{item.player.primaryRole}</td><td className="px-3 py-3 text-center tabular-nums">{item.matches}{item.matches < totalMatches && <span className="text-[#CBD5E1]">/{totalMatches}</span>}{sampleBadge(item.matches)}</td><td className="px-3 py-3 text-center font-tactical text-base font-black tabular-nums text-white">{item.kdRatio.toFixed(2)}</td><td className="px-3 py-3 text-center tabular-nums">{item.avgKills.toFixed(1)}</td><td className="px-3 py-3 text-center tabular-nums">{item.avgDeaths.toFixed(1)}</td><td className="px-3 py-3 text-center tabular-nums">{item.avgAssists.toFixed(1)}</td><td className="px-3 py-3 text-center">{metricValue(item.firstBloodTotal,item.firstBloodAverage,item.firstBloodSamples,t.dashboard.samples)}</td><td className="px-3 py-3 text-center">{metricValue(item.plantsTotal,item.plantsAverage,item.plantsSamples,t.dashboard.samples)}</td><td className="px-3 py-3 text-center">{metricValue(item.defusesTotal,item.defusesAverage,item.defusesSamples,t.dashboard.samples)}</td></tr>) : <tr><td colSpan={11} className="py-8 text-center text-[#CBD5E1]">{isEn ? "No player performance data available." : "Belum ada data pemain."}</td></tr>}</tbody></table></div>
    </CardContent>
  </Card>;
}
