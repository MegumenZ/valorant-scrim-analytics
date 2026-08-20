"use client";

import React from "react";
import {
  ShieldCheck,
  Bomb,
  Swords,
  Timer,
  ShieldAlert,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TacticalWinBreakdown, TacticalLossBreakdown, TradingKillStats } from "@/lib/utils/analytics";
import { MatchWithStats } from "@/lib/actions/matches";
import { RoundItem } from "@/lib/validations/match";

interface TacticalWinBreakdownProps {
  winData?: TacticalWinBreakdown;
  lossData?: TacticalLossBreakdown;
  tradingStats?: TradingKillStats;
  latestMatch?: MatchWithStats;
}

export function TacticalWinBreakdownWidget({
  winData,
  lossData,
  tradingStats,
  latestMatch,
}: TacticalWinBreakdownProps) {
  const defaultWins: TacticalWinBreakdown = {
    totalWins: 0,
    eliminations: 0,
    eliminationRate: 0,
    defuses: 0,
    defuseRate: 0,
    detonations: 0,
    detonationRate: 0,
    timeouts: 0,
    timeoutRate: 0,
  };

  const defaultLosses: TacticalLossBreakdown = {
    totalLosses: 0,
    eliminations: 0,
    eliminationRate: 0,
    defusedLosses: 0,
    defusedLossRate: 0,
    detonationLosses: 0,
    detonationLossRate: 0,
    timeoutLosses: 0,
    timeoutLossRate: 0,
  };

  const defaultTrade: TradingKillStats = {
    tradesWon: 0,
    tradedDeaths: 0,
    untradedDeaths: 0,
    totalDeaths: 0,
    tradeEfficiency: 0,
    tradeRating: "POOR",
  };

  const wins = winData || defaultWins;
  const losses = lossData || defaultLosses;
  const trade = tradingStats || defaultTrade;

  const hasData = wins.totalWins > 0 || losses.totalLosses > 0;

  // Parse latest match round timeline if available
  let latestRounds: RoundItem[] = [];
  if (latestMatch?.parsedRoundTimeline) {
    latestRounds = latestMatch.parsedRoundTimeline;
  } else if (latestMatch?.roundTimeline) {
    try {
      latestRounds =
        typeof latestMatch.roundTimeline === "string"
          ? JSON.parse(latestMatch.roundTimeline)
          : latestMatch.roundTimeline;
    } catch {
      latestRounds = [];
    }
  }

  const getConditionIcon = (outcome?: string | null, isWin?: boolean) => {
    if (outcome === "DEFUSE") {
      return isWin ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />;
    }
    if (outcome === "DETONATION") {
      return <Bomb className="w-3 h-3" />;
    }
    if (outcome === "TIME") {
      return <Timer className="w-3 h-3" />;
    }
    return <Swords className="w-3 h-3" />;
  };

  const getConditionLabel = (outcome?: string | null) => {
    if (outcome === "DEFUSE") return "DEFUSE";
    if (outcome === "DETONATION") return "PLANT";
    if (outcome === "TIME") return "STALL";
    return "ELIM";
  };

  return (
    <Card className="bg-[#0C1017] border-[#1C2433] overflow-hidden shadow-sm">
      {/* Tactical Telemetry Header */}
      <CardHeader className="py-3.5 px-5 border-b border-[#1C2433] bg-[#090C10]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
              // COMBAT ROUND TELEMETRY
            </div>
            <div className="flex items-center gap-2.5 mt-0.5">
              <CardTitle className="text-sm sm:text-base font-bold text-white tracking-tight">
                Analisis Taktis Ronde & Efisiensi Spacing
              </CardTitle>
            </div>
          </div>

          <div className="flex items-center gap-2 font-tactical text-xl font-black tracking-wider">
            <span className="text-emerald-400 font-mono text-sm">[ {wins.totalWins}W ]</span>
            <span className="text-[#64748B] font-mono text-xs">//</span>
            <span className="text-[#FF4655] font-mono text-sm">[ {losses.totalLosses}L ]</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-6">
        {!hasData ? (
          <div className="py-8 text-center font-mono text-xs text-[#64748B]">
            // NO_TELEMETRY_DATA: Rekam scrim pertama untuk membuka visualisasi timeline taktis.
          </div>
        ) : (
          <>
            {/* SIGNATURE ELEMENT: In-Game Round-by-Round Timeline Strip for Latest Match */}
            {latestRounds.length > 0 && latestMatch && (
              <div className="p-3.5 sm:p-4 rounded-lg bg-[#090C10] border border-[#1C2433] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1C2433] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-white tracking-wider uppercase">
                      // SEQUENCE MATCH TERAKHIR: VS {latestMatch.opponentName} ({latestMatch.map})
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold text-[#94A3B8]">
                    SKOR AKHIR:{" "}
                    <span className={latestMatch.result === "WIN" ? "text-emerald-400" : "text-[#FF4655]"}>
                      {latestMatch.scoreTeam} - {latestMatch.scoreOpponent} ({latestMatch.result})
                    </span>
                  </div>
                </div>

                {/* Tactical Round Strip (Valorant Combat Report Style) */}
                <div className="space-y-2 overflow-x-auto pb-1">
                  <div className="flex items-center gap-1.5 min-w-max">
                    {latestRounds.map((r) => {
                      const isWin = r.winner === "TEAM";
                      const outcome = r.outcomeType || r.winType;

                      return (
                        <div
                          key={r.round}
                          className={`flex flex-col items-center justify-between p-1.5 rounded border min-w-[34px] h-[52px] select-none transition-all ${
                            isWin
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                              : "bg-[#FF4655]/10 border-[#FF4655]/40 text-[#FF4655]"
                          }`}
                          title={`Ronde ${r.round} (${r.side}): ${isWin ? "WIN" : "LOSS"} - ${getConditionLabel(outcome)}`}
                        >
                          <span className="font-mono text-[8px] font-bold text-[#94A3B8]">
                            R{r.round}
                          </span>
                          <span className="my-0.5">
                            {getConditionIcon(outcome, isWin)}
                          </span>
                          <span className="font-mono text-[7px] font-bold tracking-tight">
                            {getConditionLabel(outcome)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] pt-1">
                    <span>* Hijau = Menang (W), Merah = Kalah (L)</span>
                    <span>Sisi Awal: {latestMatch.startSide}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 1. WIN CONDITIONS: Segmented Telemetry Strip */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  // DISTRIBUSI CARA MENANG ({wins.totalWins} RONDE)
                </span>
                <span className="font-mono text-[10px] text-[#94A3B8]">
                  SUCCESS_VECTORS
                </span>
              </div>

              {/* Segmented Bar for Wins */}
              <div className="w-full bg-[#090C10] h-3 rounded overflow-hidden flex border border-[#1C2433]">
                {wins.defuseRate > 0 && (
                  <div
                    className="bg-sky-400 h-full border-r border-[#090C10]"
                    style={{ width: `${wins.defuseRate}%` }}
                    title={`Retake & Defuse: ${wins.defuseRate}% (${wins.defuses} Ronde)`}
                  />
                )}
                {wins.detonationRate > 0 && (
                  <div
                    className="bg-emerald-500 h-full border-r border-[#090C10]"
                    style={{ width: `${wins.detonationRate}%` }}
                    title={`Post-Plant Boom: ${wins.detonationRate}% (${wins.detonations} Ronde)`}
                  />
                )}
                {wins.eliminationRate > 0 && (
                  <div
                    className="bg-emerald-400 h-full border-r border-[#090C10]"
                    style={{ width: `${wins.eliminationRate}%` }}
                    title={`Musuh Eliminasi: ${wins.eliminationRate}% (${wins.eliminations} Ronde)`}
                  />
                )}
                {wins.timeoutRate > 0 && (
                  <div
                    className="bg-teal-400 h-full"
                    style={{ width: `${wins.timeoutRate}%` }}
                    title={`Waktu Habis Stall: ${wins.timeoutRate}% (${wins.timeouts} Ronde)`}
                  />
                )}
              </div>

              {/* 4 Inline Telemetry Stat Elements for Wins */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-lg bg-[#090C10] border border-sky-500/30 border-l-2 border-l-sky-400 space-y-1">
                  <span className="font-mono text-[10px] text-[#94A3B8] font-semibold block uppercase">
                    Retake & Defuse
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-tactical text-2xl font-black text-white">{wins.defuses}</span>
                    <span className="font-mono text-xs font-bold text-sky-400">{wins.defuseRate}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#090C10] border border-emerald-500/30 border-l-2 border-l-emerald-500 space-y-1">
                  <span className="font-mono text-[10px] text-[#94A3B8] font-semibold block uppercase">
                    Post-Plant Boom
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-tactical text-2xl font-black text-white">{wins.detonations}</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">{wins.detonationRate}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#090C10] border border-emerald-400/30 border-l-2 border-l-emerald-400 space-y-1">
                  <span className="font-mono text-[10px] text-[#94A3B8] font-semibold block uppercase">
                    Musuh Eliminasi
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-tactical text-2xl font-black text-white">{wins.eliminations}</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">{wins.eliminationRate}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#090C10] border border-teal-500/30 border-l-2 border-l-teal-400 space-y-1">
                  <span className="font-mono text-[10px] text-[#94A3B8] font-semibold block uppercase">
                    Waktu Habis (Stall)
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-tactical text-2xl font-black text-white">{wins.timeouts}</span>
                    <span className="font-mono text-xs font-bold text-teal-400">{wins.timeoutRate}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. LOSS CONDITIONS: Segmented Telemetry Strip in Strict Red Palettes */}
            <div className="space-y-3 pt-2 border-t border-[#1C2433]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-[#FF4655] uppercase tracking-wider">
                  // DISTRIBUSI CARA KALAH ({losses.totalLosses} RONDE)
                </span>
                <span className="font-mono text-[10px] text-[#94A3B8]">
                  THREAT_VECTORS
                </span>
              </div>

              {/* Segmented Bar for Losses (Strictly Danger Red/Rose Spectrum) */}
              <div className="w-full bg-[#090C10] h-3 rounded overflow-hidden flex border border-[#1C2433]">
                {losses.defusedLossRate > 0 && (
                  <div
                    className="bg-[#FF4655] h-full border-r border-[#090C10]"
                    style={{ width: `${losses.defusedLossRate}%` }}
                    title={`Musuh Retake Spike: ${losses.defusedLossRate}% (${losses.defusedLosses} Ronde)`}
                  />
                )}
                {losses.detonationLossRate > 0 && (
                  <div
                    className="bg-[#E11D48] h-full border-r border-[#090C10]"
                    style={{ width: `${losses.detonationLossRate}%` }}
                    title={`Spike Musuh Meledak: ${losses.detonationLossRate}% (${losses.detonationLosses} Ronde)`}
                  />
                )}
                {losses.eliminationRate > 0 && (
                  <div
                    className="bg-[#BE123C] h-full border-r border-[#090C10]"
                    style={{ width: `${losses.eliminationRate}%` }}
                    title={`Tim Tereliminasi: ${losses.eliminationRate}% (${losses.eliminations} Ronde)`}
                  />
                )}
                {losses.timeoutLossRate > 0 && (
                  <div
                    className="bg-[#9F1239] h-full"
                    style={{ width: `${losses.timeoutLossRate}%` }}
                    title={`Gagal Plant 0:00: ${losses.timeoutLossRate}% (${losses.timeoutLosses} Ronde)`}
                  />
                )}
              </div>

              {/* 4 Inline Telemetry Stat Elements for Losses */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-lg bg-[#090C10] border border-[#FF4655]/30 border-l-2 border-l-[#FF4655] space-y-1">
                  <span className="font-mono text-[10px] text-[#94A3B8] font-semibold block uppercase">
                    Musuh Retake Spike
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-tactical text-2xl font-black text-white">{losses.defusedLosses}</span>
                    <span className="font-mono text-xs font-bold text-[#FF4655]">{losses.defusedLossRate}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#090C10] border border-[#FF4655]/30 border-l-2 border-l-[#E11D48] space-y-1">
                  <span className="font-mono text-[10px] text-[#94A3B8] font-semibold block uppercase">
                    Spike Musuh Meledak
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-tactical text-2xl font-black text-white">{losses.detonationLosses}</span>
                    <span className="font-mono text-xs font-bold text-[#FF4655]">{losses.detonationLossRate}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#090C10] border border-[#FF4655]/30 border-l-2 border-l-[#BE123C] space-y-1">
                  <span className="font-mono text-[10px] text-[#94A3B8] font-semibold block uppercase">
                    Tim Tereliminasi
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-tactical text-2xl font-black text-white">{losses.eliminations}</span>
                    <span className="font-mono text-xs font-bold text-[#FF4655]">{losses.eliminationRate}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#090C10] border border-[#FF4655]/30 border-l-2 border-l-[#9F1239] space-y-1">
                  <span className="font-mono text-[10px] text-[#94A3B8] font-semibold block uppercase">
                    Gagal Plant (0:00)
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-tactical text-2xl font-black text-white">{losses.timeoutLosses}</span>
                    <span className="font-mono text-xs font-bold text-[#FF4655]">{losses.timeoutLossRate}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. TRADING KILLS & SPACING TELEMETRY GAUGE */}
            <div className="p-3.5 sm:p-4 rounded-lg bg-[#090C10] border border-[#1C2433] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider">
                  // EFISIENSI TRADE & SPACING REFRAG
                </span>
                <span className="font-mono text-xs font-bold text-sky-400">
                  {trade.tradeEfficiency}% TRADE RATE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded bg-[#0C1017] border border-emerald-500/30 border-l-2 border-l-emerald-400">
                  <span className="font-mono text-[10px] text-emerald-400 font-semibold block uppercase">
                    Kematian Di-Trade
                  </span>
                  <span className="font-tactical text-2xl font-black text-emerald-400">{trade.tradedDeaths}</span>
                  <span className="font-mono text-[10px] text-[#94A3B8] block">Dibalas cepat rekan</span>
                </div>
                <div className="p-3 rounded bg-[#0C1017] border border-sky-500/30 border-l-2 border-l-sky-400">
                  <span className="font-mono text-[10px] text-sky-400 font-semibold block uppercase">
                    Refrag Kills
                  </span>
                  <span className="font-tactical text-2xl font-black text-sky-400">{trade.tradesWon}</span>
                  <span className="font-mono text-[10px] text-[#94A3B8] block">Kill balasan didapat</span>
                </div>
                <div className="p-3 rounded bg-[#0C1017] border border-[#FF4655]/30 border-l-2 border-l-[#FF4655]">
                  <span className="font-mono text-[10px] text-[#FF4655] font-semibold block uppercase">
                    Dry Deaths (Terisolasi)
                  </span>
                  <span className="font-tactical text-2xl font-black text-[#FF4655]">{trade.untradedDeaths}</span>
                  <span className="font-mono text-[10px] text-[#94A3B8] block">Mati tanpa refrag</span>
                </div>
              </div>

              {/* Segmented Efficiency Telemetry Bar */}
              <div className="w-full bg-[#0C1017] h-2.5 rounded overflow-hidden flex border border-[#1C2433]">
                <div
                  className="bg-emerald-400 h-full transition-all"
                  style={{ width: `${trade.tradeEfficiency}%` }}
                />
                <div
                  className="bg-[#FF4655] h-full transition-all"
                  style={{ width: `${100 - trade.tradeEfficiency}%` }}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
