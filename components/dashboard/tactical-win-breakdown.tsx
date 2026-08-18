import React from "react";
import { ShieldCheck, Bomb, Swords, Timer, Sparkles, Zap, Flame } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TacticalWinBreakdown, TradingKillStats, RoundPacingStats, formatRoundDuration } from "@/lib/utils/analytics";

interface TacticalWinBreakdownWidgetProps {
  data?: TacticalWinBreakdown;
  tradingStats?: TradingKillStats;
  pacingStats?: RoundPacingStats;
}

export function TacticalWinBreakdownWidget({ data, tradingStats, pacingStats }: TacticalWinBreakdownWidgetProps) {
  const stats = data || {
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

  const trade = tradingStats || {
    tradesWon: 0,
    tradedDeaths: 0,
    untradedDeaths: 0,
    totalDeaths: 0,
    tradeEfficiency: 0,
    tradeRating: "GOOD",
  };

  const pacing = pacingStats || {
    avgWinDurationSec: 52,
    avgLossDurationSec: 38,
    fastWins: 0,
    midWins: 0,
    lateWins: 0,
    fastLosses: 0,
    midLosses: 0,
    lateLosses: 0,
  };

  const hasData = stats.totalWins > 0;

  return (
    <Card className="bg-[#0F141C] border-[#1C2433]">
      <CardHeader className="py-4 px-5 border-b border-[#1C2433]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <CardTitle className="text-sm font-semibold text-white">
              Analisis Taktikal Tim (Win Conditions, Trading Kills & Pacing)
            </CardTitle>
          </div>
          <span className="text-xs text-[#94A3B8]">
            Total {stats.totalWins} Ronde Menang
          </span>
        </div>
        <CardDescription className="text-xs text-[#94A3B8]">
          Evaluasi mendalam strategi tim: cara menang ronde, efektivitas trade frags, dan perbandingan durasi waktu ronde
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {!hasData ? (
          <div className="py-8 text-center text-xs text-[#64748B]">
            Belum ada data kemenangan ronde dengan kronologi taktis. Catat scrim baru untuk melihat analitik.
          </div>
        ) : (
          <>
            {/* 1. WIN CONDITIONS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Retake & Defuse */}
              <div className="p-4 rounded-xl bg-[#090C10] border border-sky-500/20 space-y-2.5 flex flex-col justify-between hover:border-sky-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Retake & Defuse
                  </span>
                  <span className="text-xs font-bold text-sky-400 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded-full">
                    {stats.defuseRate}%
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">
                    {stats.defuses} <span className="text-xs font-normal text-[#94A3B8]">Ronde</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
                    Sukses retake & defuse spike saat bertahan (Defense).
                  </p>
                </div>
                <div className="w-full bg-[#161D28] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full rounded-full transition-all" style={{ width: `${stats.defuseRate}%` }} />
                </div>
              </div>

              {/* Post-Plant */}
              <div className="p-4 rounded-xl bg-[#090C10] border border-amber-500/20 space-y-2.5 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Bomb className="w-4 h-4" />
                    Post-Plant (Boom)
                  </span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    {stats.detonationRate}%
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">
                    {stats.detonations} <span className="text-xs font-normal text-[#94A3B8]">Ronde</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
                    Spike ditanam & meledak saat menyerang (Attack).
                  </p>
                </div>
                <div className="w-full bg-[#161D28] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${stats.detonationRate}%` }} />
                </div>
              </div>

              {/* Elimination */}
              <div className="p-4 rounded-xl bg-[#090C10] border border-rose-500/20 space-y-2.5 flex flex-col justify-between hover:border-rose-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <Swords className="w-4 h-4" />
                    Musuh Eliminasi
                  </span>
                  <span className="text-xs font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full">
                    {stats.eliminationRate}%
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">
                    {stats.eliminations} <span className="text-xs font-normal text-[#94A3B8]">Ronde</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
                    Semua musuh tereliminasi melalui baku tembak bersih.
                  </p>
                </div>
                <div className="w-full bg-[#161D28] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-400 h-full rounded-full transition-all" style={{ width: `${stats.eliminationRate}%` }} />
                </div>
              </div>

              {/* Time Expired */}
              <div className="p-4 rounded-xl bg-[#090C10] border border-emerald-500/20 space-y-2.5 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Timer className="w-4 h-4" />
                    Waktu Habis
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    {stats.timeoutRate}%
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">
                    {stats.timeouts} <span className="text-xs font-normal text-[#94A3B8]">Ronde</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
                    Menahan site hingga timer ronde berakhir (0:00).
                  </p>
                </div>
                <div className="w-full bg-[#161D28] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full transition-all" style={{ width: `${stats.timeoutRate}%` }} />
                </div>
              </div>
            </div>

            {/* 2. DUAL METRICS: TRADING KILLS & ROUND PACING */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-[#1C2433]">
              {/* TRADING KILLS WIDGET */}
              <div className="p-4 rounded-xl bg-[#090C10] border border-[#1C2433] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Swords className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-white">Analisis Trading Kills (Refrags)</span>
                  </div>
                  <Badge
                    variant={trade.tradeEfficiency >= 60 ? "win" : trade.tradeEfficiency >= 45 ? "draw" : "loss"}
                    className="text-[11px] font-bold"
                  >
                    {trade.tradeEfficiency}% Trade Efficiency
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-[#0F141C] border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 font-semibold block">Di-Trade</span>
                    <span className="text-lg font-black text-emerald-400">{trade.tradedDeaths}</span>
                    <span className="text-[9px] text-[#64748B]">Kematian dibalas</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0F141C] border border-sky-500/20">
                    <span className="text-[10px] text-sky-400 font-semibold block">Kill Trade</span>
                    <span className="text-lg font-black text-sky-400">{trade.tradesWon}</span>
                    <span className="text-[9px] text-[#64748B]">Refrag didapat</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0F141C] border border-rose-500/20">
                    <span className="text-[10px] text-rose-400 font-semibold block">Dry Deaths</span>
                    <span className="text-lg font-black text-rose-400">{trade.untradedDeaths}</span>
                    <span className="text-[9px] text-[#64748B]">Mati terisolasi</span>
                  </div>
                </div>

                <div className="w-full bg-[#161D28] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      trade.tradeEfficiency >= 60 ? "bg-emerald-400" : trade.tradeEfficiency >= 45 ? "bg-amber-400" : "bg-rose-400"
                    }`}
                    style={{ width: `${trade.tradeEfficiency}%` }}
                  />
                </div>

                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  {trade.tradeEfficiency >= 60
                    ? "🔥 Spacing tim sangat rapat. Sebagian besar kematian rekan berhasil dibalas (refrag) cepat."
                    : trade.tradeEfficiency >= 45
                    ? `⚡ Efektivitas trade cukup baik, namun terdapat ${trade.untradedDeaths} kematian tanpa trade akibat rotasi terpisah.`
                    : `⚠️ Perlu evaluasi jarak antar pemain: ${trade.untradedDeaths} kematian terjadi tanpa ada rekan yang membalas kill.`}
                </p>
              </div>

              {/* ROUND PACING & DURATION WIDGET */}
              <div className="p-4 rounded-xl bg-[#090C10] border border-[#1C2433] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-white">Kecepatan & Waktu Ronde (Pacing)</span>
                  </div>
                  <span className="text-[11px] text-[#94A3B8]">Menang vs Kalah</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-[#0F141C] border border-emerald-500/20 space-y-1">
                    <span className="text-[10px] text-emerald-400 font-semibold block">Rata-rata Ronde Menang</span>
                    <div className="text-xl font-black font-mono text-white">{formatRoundDuration(pacing.avgWinDurationSec)}</div>
                    <span className="text-[10px] text-[#94A3B8]">
                      {pacing.avgWinDurationSec < 45 ? "⚡ Fast Rush (<45s)" : pacing.avgWinDurationSec <= 75 ? "⚖️ Mid Exec (45-75s)" : "⏳ Late Exec (>75s)"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#0F141C] border border-rose-500/20 space-y-1">
                    <span className="text-[10px] text-rose-400 font-semibold block">Rata-rata Ronde Kalah</span>
                    <div className="text-xl font-black font-mono text-white">{formatRoundDuration(pacing.avgLossDurationSec)}</div>
                    <span className="text-[10px] text-[#94A3B8]">
                      {pacing.avgLossDurationSec < 45 ? "⚡ Early Pick (<45s)" : pacing.avgLossDurationSec <= 75 ? "⚖️ Mid Round (45-75s)" : "⏳ Late Loss (>75s)"}
                    </span>
                  </div>
                </div>

                {/* Progress bar comparison */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="w-full bg-[#161D28] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, (pacing.avgWinDurationSec / 100) * 100)}%` }} />
                  </div>
                  <div className="w-full bg-[#161D28] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-400 h-full rounded-full" style={{ width: `${Math.min(100, (pacing.avgLossDurationSec / 100) * 100)}%` }} />
                  </div>
                </div>

                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  {pacing.avgWinDurationSec > pacing.avgLossDurationSec
                    ? `💡 Tim lebih konsisten menang saat bermain tempo sabar (${formatRoundDuration(pacing.avgWinDurationSec)}), namun sering kehilangan ronde jika ter-pick sebelum ${formatRoundDuration(pacing.avgLossDurationSec)}.`
                    : `💡 Tim sangat kuat saat eksekusi agresif tempo cepat (${formatRoundDuration(pacing.avgWinDurationSec)}), namun kesulitan saat ronde berlarut-larut.`}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
