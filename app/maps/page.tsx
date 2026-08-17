import React from "react";
import Link from "next/link";
import { Map as MapIcon, PlusCircle } from "lucide-react";
import { getMapAnalyticsData } from "@/lib/actions/matches";
import { MAP_METADATA, ValorantMap } from "@/lib/data/valorant";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function MapsAnalyticsPage() {
  const [mapData, user] = await Promise.all([
    getMapAnalyticsData(),
    getCurrentUser(),
  ]);

  const isAdmin = user ? (user.role === "ADMIN" || user.role === "COACH") : false;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242e40] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            <MapIcon className="w-6 h-6 text-rose-500" />
            <span>Analitik Peta & Side Balance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluasi persentase kemenangan tim dan perbandingan rasio kemenangan di sisi Attack (Penyerang) vs Defense (Bertahan).
          </p>
        </div>

        {isAdmin && (
          <Link href="/matches/new">
            <Button size="sm" className="gap-1.5 font-bold shadow-md shadow-rose-950/40">
              <PlusCircle className="w-4 h-4" />
              <span>+ Catat Match Map</span>
            </Button>
          </Link>
        )}
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
              className="bg-[#141a24] hover:border-[#334155] transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Header Gradient */}
              <div className={`p-4 bg-gradient-to-r ${meta.color} border-b border-[#242e40]`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wide text-white">
                      {stat.map}
                    </h3>
                    <p className="text-xs text-slate-300">
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
                    <Badge variant="outline" className="text-xs text-slate-400">
                      Belum Dimainkan
                    </Badge>
                  )}
                </div>
              </div>

              {/* Card Content & Stats */}
              <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
                <p className="text-xs text-slate-400 italic">
                  "{meta.callout}"
                </p>

                {/* Progress Bar Win Rate */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Rekor Menang/Kalah:</span>
                    <span className={`font-bold ${stat.winRate >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
                      {stat.wins}W - {stat.losses}L ({stat.winRate}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#0e131b] rounded-full overflow-hidden border border-[#242e40]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stat.winRate >= 50 ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${stat.winRate}%` }}
                    />
                  </div>
                </div>

                {/* Rounds Won/Lost */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#242e40]/70 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#0e131b] border border-[#242e40]">
                    <div className="text-slate-400">Ronde Menang:</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {stat.roundsWon} <span className="text-[11px] text-slate-500 font-normal">({stat.roundWinRate}%)</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0e131b] border border-[#242e40]">
                    <div className="text-slate-400">Ronde Kalah:</div>
                    <div className="text-sm font-bold text-rose-400 mt-0.5">
                      {stat.roundsLost}
                    </div>
                  </div>
                </div>

                {/* Side Bias (Attack vs Defense Start) */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-semibold text-slate-300">
                    Sisi Awal Pertandingan
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-rose-400 flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Mulai Attack:
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {stat.attackStartWins}/{stat.attackStartMatches} Menang ({attackWinRate}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sky-400 flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      Mulai Defense:
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {stat.defenseStartWins}/{stat.defenseStartMatches} Menang ({defenseWinRate}%)
                    </span>
                  </div>
                </div>
              </CardContent>

              {/* Card Footer */}
              <div className="p-3.5 border-t border-[#242e40] bg-[#0e131b] flex items-center justify-between text-xs text-slate-400">
                <span>Total Scrim: <strong className="text-slate-200">{stat.totalMatches} Match</strong></span>
                <Link href={`/matches?map=${stat.map}`}>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-rose-400 hover:bg-rose-500/10">
                    Filter Match &rarr;
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
