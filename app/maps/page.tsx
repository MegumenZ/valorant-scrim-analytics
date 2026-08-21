import React from "react";
import Link from "next/link";
import { getMapAnalyticsData } from "@/lib/actions/matches";
import { MAP_METADATA, ValorantMap } from "@/lib/data/valorant";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function MapsAnalyticsPage() {
  const mapData = await getMapAnalyticsData();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1C2433] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Statistik & Analisis Map
          </h1>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Efektivitas taktis, win rate ronde, dan bias sisi awal pada setiap map
          </p>
        </div>
      </div>

      {/* MAPS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mapData.map((stat) => {
          const meta = MAP_METADATA[stat.map as ValorantMap] || {
            name: stat.map,
            location: "Valorant Protocol",
            callout: "Standard Tactical Map",
            color: "from-slate-900 to-slate-950",
          };

          const hasMatches = stat.totalMatches > 0;
          const attackWinRate =
            stat.attackStartMatches > 0
              ? Math.round((stat.attackStartWins / stat.attackStartMatches) * 100)
              : 0;
          const defenseWinRate =
            stat.defenseStartMatches > 0
              ? Math.round((stat.defenseStartWins / stat.defenseStartMatches) * 100)
              : 0;

          const tacticalStatus = (() => {
            if (!hasMatches) {
              return { label: "Belum Dimainkan", color: "text-[#94A3B8]", bg: "bg-black/60", border: "border-[#1C2433]" };
            }
            if (stat.totalMatches === 1) {
              return { label: "Perlu Data", color: "text-[#94A3B8]", bg: "bg-[#161D28]", border: "border-[#2A364F]" };
            }
            if (stat.winRate >= 70) {
              return { label: "Auto-Pick", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/40" };
            }
            if (stat.winRate >= 50) {
              return { label: "Comfort Pick", color: "text-sky-400", bg: "bg-sky-500/15", border: "border-sky-500/30" };
            }
            return { label: "Perma-Ban", color: "text-[#FF4655]", bg: "bg-[#FF4655]/15", border: "border-[#FF4655]/40" };
          })();

          return (
            <Card
              key={stat.map}
              className="bg-[#0C1017] border-[#1C2433] hover:border-[#2A364F] transition-all overflow-hidden flex flex-col justify-between rounded-lg shadow-sm"
            >
              {/* Header with Map Banner */}
              <div className="relative h-28 overflow-hidden border-b border-[#1C2433] flex items-end p-4">
                <img
                  src={meta.listViewIcon}
                  alt={stat.map}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover object-center brightness-75 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C1017] via-[#0C1017]/50 to-transparent" />
                <div className="relative z-10 flex items-center justify-between w-full">
                  <div>
                    <h3 className="font-tactical font-black text-2xl text-white uppercase tracking-wide drop-shadow-md">
                      {stat.map}
                    </h3>
                    <p className="text-[11px] text-[#94A3B8] font-medium drop-shadow-sm">
                      {meta.location}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {hasMatches ? (
                      <div
                        className={`px-2.5 py-0.5 rounded border font-tactical text-base font-black tracking-wider uppercase ${
                          stat.winRate >= 50
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-[#FF4655]/10 text-[#FF4655] border-[#FF4655]/40"
                        }`}
                      >
                        {stat.winRate}% WIN
                      </div>
                    ) : null}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border backdrop-blur-sm ${tacticalStatus.bg} ${tacticalStatus.border} ${tacticalStatus.color}`}>
                      {tacticalStatus.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Content & Stats */}
              <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
                {/* Segmented Progress Bar Win Rate */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#94A3B8]">Rekor Pertandingan:</span>
                    <span className={`font-semibold tabular-nums ${stat.winRate >= 50 ? "text-emerald-400" : "text-[#FF4655]"}`}>
                      {stat.wins}W - {stat.losses}L ({stat.winRate}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#090C10] rounded-full overflow-hidden flex border border-[#1C2433]">
                    {hasMatches ? (
                      <>
                        <div
                          className="h-full bg-emerald-400 transition-all"
                          style={{ width: `${stat.winRate}%` }}
                        />
                        <div
                          className="h-full bg-[#FF4655] transition-all"
                          style={{ width: `${100 - stat.winRate}%` }}
                        />
                      </>
                    ) : (
                      <div className="h-full w-full bg-[#1C2433]" />
                    )}
                  </div>
                </div>

                {/* Rounds Won/Lost */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#1C2433] text-xs">
                  <div className="p-2.5 rounded-lg bg-[#090C10] border border-emerald-500/20 border-l-2 border-l-emerald-400">
                    <div className="text-[11px] text-[#94A3B8]">Ronde Menang:</div>
                    <div className="font-tactical text-xl font-black text-emerald-400 mt-0.5 tabular-nums">
                      {stat.roundsWon} <span className="text-xs text-[#94A3B8] font-normal">({stat.roundWinRate}%)</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#090C10] border border-[#FF4655]/20 border-l-2 border-l-[#FF4655]">
                    <div className="text-[11px] text-[#94A3B8]">Ronde Kalah:</div>
                    <div className="font-tactical text-xl font-black text-[#FF4655] mt-0.5 tabular-nums">
                      {stat.roundsLost}
                    </div>
                  </div>
                </div>

                {/* Side Bias (Attack vs Defense Start) */}
                <div className="space-y-2 pt-1 border-t border-[#1C2433]">
                  <div className="text-xs font-semibold text-white">
                    Efektivitas Sisi Awal
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#FF4655] font-medium">
                      Mulai Attack:
                    </span>
                    <span className="text-white font-semibold tabular-nums">
                      {stat.attackStartWins}/{stat.attackStartMatches} Menang ({attackWinRate}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sky-400 font-medium">
                      Mulai Defense:
                    </span>
                    <span className="text-white font-semibold tabular-nums">
                      {stat.defenseStartWins}/{stat.defenseStartMatches} Menang ({defenseWinRate}%)
                    </span>
                  </div>
                </div>
              </CardContent>

              {/* Card Footer */}
              <div className="p-3.5 border-t border-[#1C2433] bg-[#090C10]/40 flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Total Scrim: <strong className="text-white font-semibold">{stat.totalMatches} Match</strong></span>
                <Link href={`/matches?map=${stat.map}`}>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#94A3B8] hover:text-white hover:bg-[#1C2433]">
                    Lihat Match &rarr;
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
