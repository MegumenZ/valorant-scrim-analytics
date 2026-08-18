import React from "react";
import { ShieldCheck, Bomb, Swords, Timer, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { TacticalWinBreakdown } from "@/lib/utils/analytics";

interface TacticalWinBreakdownWidgetProps {
  data?: TacticalWinBreakdown;
}

export function TacticalWinBreakdownWidget({ data }: TacticalWinBreakdownWidgetProps) {
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

  const hasData = stats.totalWins > 0;

  return (
    <Card className="bg-[#0F141C] border-[#1C2433]">
      <CardHeader className="py-4 px-5 border-b border-[#1C2433]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <CardTitle className="text-sm font-semibold text-white">
              Analisis Taktis Cara Menang Ronde (Win Conditions)
            </CardTitle>
          </div>
          <span className="text-xs text-[#94A3B8]">
            Total {stats.totalWins} Ronde Menang
          </span>
        </div>
        <CardDescription className="text-xs text-[#94A3B8]">
          Distribusi strategi tim saat memenangkan ronde scrim (Retake, Post-Plant, Eliminasi, dan Penahanan Waktu)
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5">
        {!hasData ? (
          <div className="py-8 text-center text-xs text-[#64748B]">
            Belum ada data kemenangan ronde dengan kronologi taktis. Catat scrim baru untuk melihat analitik.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Retake & Defuse */}
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

            {/* 2. Post-Plant (Detonation) */}
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

            {/* 3. Elimination */}
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

            {/* 4. Time Expired */}
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
        )}
      </CardContent>
    </Card>
  );
}
