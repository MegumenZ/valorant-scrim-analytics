import React from "react";
import Link from "next/link";
import { getMapAnalyticsData } from "@/lib/actions/matches";
import { MAP_METADATA, ValorantMap } from "@/lib/data/valorant";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function MapsAnalyticsPage() {
  const mapData = await getMapAnalyticsData();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-[#1C2433] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Statistik Map
          </h1>
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

          return (
            <Card
              key={stat.map}
              className="bg-[#0F141C] border-[#1C2433] hover:border-[#2A364F] transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Header with Map Splash Art Banner */}
              <div className="relative h-28 overflow-hidden border-b border-[#1C2433] flex items-end p-4">
                <img
                  src={meta.splash}
                  alt={stat.map}
                  className="absolute inset-0 w-full h-full object-cover object-center brightness-75 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F141C] via-[#0F141C]/40 to-transparent" />
                <div className="relative z-10 flex items-center justify-between w-full">
                  <div>
                    <h3 className="text-lg font-bold text-white drop-shadow-md">
                      {stat.map}
                    </h3>
                    <p className="text-[11px] text-[#94A3B8] font-medium drop-shadow-sm">
                      {meta.location}
                    </p>
                  </div>
                  {hasMatches ? (
                    <Badge
                      variant={stat.winRate >= 50 ? "win" : "loss"}
                      className="text-xs px-2.5 py-0.5"
                    >
                      {stat.winRate}% Win
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-[#94A3B8] bg-black/60 backdrop-blur-sm">
                      Belum Dimainkan
                    </Badge>
                  )}
                </div>
              </div>

              {/* Card Content & Stats */}
              <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
                {/* Progress Bar Win Rate */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#94A3B8]">Rekor Menang / Kalah:</span>
                    <span className={`font-semibold ${stat.winRate >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
                      {stat.wins}W - {stat.losses}L ({stat.winRate}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#090C10] rounded-full overflow-hidden border border-[#1C2433]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stat.winRate >= 50 ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${stat.winRate}%` }}
                    />
                  </div>
                </div>

                {/* Rounds Won/Lost */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#1C2433] text-xs">
                  <div className="p-2.5 rounded-lg bg-[#090C10] border border-[#1C2433]">
                    <div className="text-[#94A3B8]">Ronde Menang:</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {stat.roundsWon} <span className="text-[11px] text-[#64748B] font-normal">({stat.roundWinRate}%)</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#090C10] border border-[#1C2433]">
                    <div className="text-[#94A3B8]">Ronde Kalah:</div>
                    <div className="text-sm font-bold text-rose-400 mt-0.5">
                      {stat.roundsLost}
                    </div>
                  </div>
                </div>

                {/* Side Bias (Attack vs Defense Start) */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-semibold text-white">
                    Sisi Awal Pertandingan
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-rose-400 font-medium">
                      Mulai Attack:
                    </span>
                    <span className="text-white font-semibold">
                      {stat.attackStartWins}/{stat.attackStartMatches} Menang ({attackWinRate}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sky-400 font-medium">
                      Mulai Defense:
                    </span>
                    <span className="text-white font-semibold">
                      {stat.defenseStartWins}/{stat.defenseStartMatches} Menang ({defenseWinRate}%)
                    </span>
                  </div>
                </div>
              </CardContent>

              {/* Card Footer */}
              <div className="p-3.5 border-t border-[#1C2433] bg-[#090C10]/40 flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Total Scrim: <strong className="text-white">{stat.totalMatches} Match</strong></span>
                <Link href={`/matches?map=${stat.map}`}>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-rose-400 hover:bg-rose-500/10">
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

