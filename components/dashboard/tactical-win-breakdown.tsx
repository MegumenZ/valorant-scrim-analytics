import React from "react";
import { ShieldCheck, Bomb, Swords, Timer, Sparkles, XCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TacticalWinBreakdown, TacticalLossBreakdown, TradingKillStats } from "@/lib/utils/analytics";

interface TacticalWinBreakdownWidgetProps {
  winData?: TacticalWinBreakdown;
  lossData?: TacticalLossBreakdown;
  tradingStats?: TradingKillStats;
}

export function TacticalWinBreakdownWidget({ winData, lossData, tradingStats }: TacticalWinBreakdownWidgetProps) {
  const wins = winData || {
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

  const losses = lossData || {
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

  const trade = tradingStats || {
    tradesWon: 0,
    tradedDeaths: 0,
    untradedDeaths: 0,
    totalDeaths: 0,
    tradeEfficiency: 0,
    tradeRating: "GOOD",
  };

  const hasData = wins.totalWins > 0 || losses.totalLosses > 0;

  return (
    <Card className="bg-[#0F141C] border-[#1C2433]">
      <CardHeader className="py-4 px-5 border-b border-[#1C2433]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-white">
            Analisis Taktikal Ronde (Cara Menang, Cara Kalah & Trading Kills)
          </CardTitle>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400 font-bold">{wins.totalWins} W</span>
            <span className="text-[#94A3B8]">•</span>
            <span className="text-rose-400 font-bold">{losses.totalLosses} L</span>
          </div>
        </div>
        <CardDescription className="text-xs text-[#94A3B8]">
          Evaluasi mendalam strategi tim: cara memenangkan ronde, penyebab kekalahan ronde, dan efektivitas crosshair trade
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {!hasData ? (
          <div className="py-8 text-center text-xs text-[#64748B]">
            Belum ada data ronde dengan kronologi taktis. Catat scrim baru untuk melihat analitik.
          </div>
        ) : (
          <>
            {/* 1. WIN CONDITIONS (CARA MENANG) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Analisis Cara Menang ({wins.totalWins} Ronde)</span>
                </div>
                <span className="text-[11px] text-[#94A3B8]">Logika Taktis Attack vs Defense</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Retake & Defuse (Defender) */}
                <div className="p-3.5 rounded-xl bg-[#090C10] border border-sky-500/20 space-y-2 flex flex-col justify-between hover:border-sky-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Retake & Defuse
                    </span>
                    <span className="text-[11px] font-bold text-sky-400 bg-sky-500/15 border border-sky-500/30 px-1.5 py-0.5 rounded-md">
                      {wins.defuseRate}%
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-black text-white">
                      {wins.defuses} <span className="text-xs font-normal text-[#94A3B8]">Ronde</span>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-relaxed">
                      Sukses retake site & defuse spike saat bertahan (Defense).
                    </p>
                  </div>
                  <div className="w-full bg-[#161D28] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sky-400 h-full rounded-full" style={{ width: `${wins.defuseRate}%` }} />
                  </div>
                </div>

                {/* Post-Plant Boom (Attacker) */}
                <div className="p-3.5 rounded-xl bg-[#090C10] border border-amber-500/20 space-y-2 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Bomb className="w-3.5 h-3.5" />
                      Post-Plant Boom
                    </span>
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                      {wins.detonationRate}%
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-black text-white">
                      {wins.detonations} <span className="text-xs font-normal text-[#94A3B8]">Ronde</span>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-relaxed">
                      Spike meledak sukses dijaga saat menyerang (Attack).
                    </p>
                  </div>
                  <div className="w-full bg-[#161D28] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: `${wins.detonationRate}%` }} />
                  </div>
                </div>

                {/* Clean Elimination */}
                <div className="p-3.5 rounded-xl bg-[#090C10] border border-rose-500/20 space-y-2 flex flex-col justify-between hover:border-rose-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                      <Swords className="w-3.5 h-3.5" />
                      Musuh Eliminasi
                    </span>
                    <span className="text-[11px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 rounded-md">
                      {wins.eliminationRate}%
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-black text-white">
                      {wins.eliminations} <span className="text-xs font-normal text-[#94A3B8]">Ronde</span>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-relaxed">
                      Wipe out seluruh musuh melalui duel aim & utilitas.
                    </p>
                  </div>
                  <div className="w-full bg-[#161D28] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-400 h-full rounded-full" style={{ width: `${wins.eliminationRate}%` }} />
                  </div>
                </div>

                {/* Time Expired (Defense Stall) */}
                <div className="p-3.5 rounded-xl bg-[#090C10] border border-emerald-500/20 space-y-2 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5" />
                      Waktu Habis (Stall)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                      {wins.timeoutRate}%
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-black text-white">
                      {wins.timeouts} <span className="text-xs font-normal text-[#94A3B8]">Ronde</span>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-relaxed">
                      Menahan site hingga waktu 0:00 berakhir saat bertahan (Defense).
                    </p>
                  </div>
                  <div className="w-full bg-[#161D28] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${wins.timeoutRate}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. LOSS CONDITIONS (CARA KALAH) */}
            <div className="space-y-3 pt-2 border-t border-[#1C2433]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Analisis Cara Kalah ({losses.totalLosses} Ronde)</span>
                </div>
                <span className="text-[11px] text-[#94A3B8]">Identifikasi Kelemahan Taktis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Musuh Retake & Defuse (Saat Kita Attack) */}
                <div className="p-3.5 rounded-xl bg-[#090C10] border border-sky-500/20 space-y-2 flex flex-col justify-between hover:border-sky-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Musuh Retake Spike
                    </span>
                    <span className="text-[11px] font-bold text-sky-400 bg-sky-500/15 border border-sky-500/30 px-1.5 py-0.5 rounded-md">
                      {losses.defusedLossRate}%
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-black text-white">
                      {losses.defusedLosses} <span className="text-xs font-normal text-[#94A3B8]">Ronde</span>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-relaxed">
                      Spike kita didefuse oleh musuh saat post-plant attack.
                    </p>
                  </div>
                  <div className="w-full bg-[#161D28] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sky-400 h-full rounded-full" style={{ width: `${losses.defusedLossRate}%` }} />
                  </div>
                </div>

                {/* Spike Musuh Meledak (Saat Kita Defense) */}
                <div className="p-3.5 rounded-xl bg-[#090C10] border border-amber-500/20 space-y-2 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Bomb className="w-3.5 h-3.5" />
                      Spike Musuh Meledak
                    </span>
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                      {losses.detonationLossRate}%
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-black text-white">
                      {losses.detonationLosses} <span className="text-xs font-normal text-[#94A3B8]">Ronde</span>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-relaxed">
                      Gagal retake spike musuh saat defense sebelum meledak.
                    </p>
                  </div>
                  <div className="w-full bg-[#161D28] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: `${losses.detonationLossRate}%` }} />
                  </div>
                </div>

                {/* Tim Tereliminasi */}
                <div className="p-3.5 rounded-xl bg-[#090C10] border border-rose-500/20 space-y-2 flex flex-col justify-between hover:border-rose-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                      <Swords className="w-3.5 h-3.5" />
                      Tim Tereliminasi
                    </span>
                    <span className="text-[11px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 rounded-md">
                      {losses.eliminationRate}%
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-black text-white">
                      {losses.eliminations} <span className="text-xs font-normal text-[#94A3B8]">Ronde</span>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-relaxed">
                      Semua anggota tim mati sebelum spike dipasang/didefuse.
                    </p>
                  </div>
                  <div className="w-full bg-[#161D28] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-400 h-full rounded-full" style={{ width: `${losses.eliminationRate}%` }} />
                  </div>
                </div>

                {/* Waktu Habis Gagal Plant (Attacker Timeout) */}
                <div className="p-3.5 rounded-xl bg-[#090C10] border border-emerald-500/20 space-y-2 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Timer className="w-3.5 h-3.5" />
                      Gagal Plant (0:00)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                      {losses.timeoutLossRate}%
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-black text-white">
                      {losses.timeoutLosses} <span className="text-xs font-normal text-[#94A3B8]">Ronde</span>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-relaxed">
                      Kehabisan waktu ronde sebelum sempat plant spike (Attack).
                    </p>
                  </div>
                  <div className="w-full bg-[#161D28] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${losses.timeoutLossRate}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. TRADING KILLS & REFRAGS PANEL */}
            <div className="p-4 rounded-xl bg-[#090C10] border border-[#1C2433] space-y-3.5 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold text-white">Analisis Trading Kills & Crosshair Spacing</span>
                </div>
                <Badge
                  variant={trade.tradeEfficiency >= 60 ? "win" : trade.tradeEfficiency >= 45 ? "draw" : "loss"}
                  className="text-[11px] font-bold"
                >
                  {trade.tradeEfficiency}% Trade Efficiency
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-[#0F141C] border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 font-semibold block">Kematian Di-Trade</span>
                  <span className="text-xl font-black text-emerald-400">{trade.tradedDeaths}</span>
                  <span className="text-[10px] text-[#94A3B8] block">Kematian berhasil dibalas rekan</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0F141C] border border-sky-500/20">
                  <span className="text-[10px] text-sky-400 font-semibold block">Refrag Kills</span>
                  <span className="text-xl font-black text-sky-400">{trade.tradesWon}</span>
                  <span className="text-[10px] text-[#94A3B8] block">Kill balasan didapat</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0F141C] border border-rose-500/20">
                  <span className="text-[10px] text-rose-400 font-semibold block">Dry Deaths</span>
                  <span className="text-xl font-black text-rose-400">{trade.untradedDeaths}</span>
                  <span className="text-[10px] text-[#94A3B8] block">Mati terisolasi tanpa balasan</span>
                </div>
              </div>

              <div className="w-full bg-[#161D28] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    trade.tradeEfficiency >= 60 ? "bg-emerald-400" : trade.tradeEfficiency >= 45 ? "bg-amber-400" : "bg-rose-400"
                  }`}
                  style={{ width: `${trade.tradeEfficiency}%` }}
                />
              </div>

              <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                {trade.tradeEfficiency >= 60
                  ? "🔥 Spacing tim sangat rapat. Sebagian besar kematian rekan berhasil dibalas (refrag) cepat, minim dry death."
                  : trade.tradeEfficiency >= 45
                  ? `⚡ Efektivitas trade cukup baik, namun masih terdapat ${trade.untradedDeaths} kematian tanpa trade akibat rotasi terpisah atau duel sendiri.`
                  : `⚠️ Perlu evaluasi jarak antar pemain: ${trade.untradedDeaths} kematian terjadi tanpa ada rekan yang membalas kill.`}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
