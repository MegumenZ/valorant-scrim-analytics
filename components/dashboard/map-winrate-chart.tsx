"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ValorantMap } from "@/lib/data/valorant";
import { useTranslation } from "@/lib/i18n/context";

interface MapChartItem {
  map: ValorantMap;
  total: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export function MapWinrateChart({ data }: { data: MapChartItem[] }) {
  const { language } = useTranslation();
  const isEn = language === "en";
  const summary = data.map((item) => `${item.map}: ${item.winRate}% (${item.total} ${isEn ? "games" : "game"}), ${item.wins} ${isEn ? "wins" : "menang"}, ${item.losses} ${isEn ? "losses" : "kalah"}${item.draws ? `, ${item.draws} ${isEn ? "draws" : "seri"}` : ""}.`).join(" ");

  return <Card className="overflow-hidden rounded-xl border-[#1C2433] bg-[#0C1017] text-[#F1F5F9] shadow-none">
    <CardHeader className="border-b border-[#1C2433] px-5 py-5 sm:px-6">
      <CardTitle className="text-base font-semibold text-white">{isEn ? "Win Rate by Map" : "Win Rate per Map"}</CardTitle>
      <p className="text-sm text-[#CBD5E1]">{isEn ? "Win percentage and game count for every map played." : "Persentase kemenangan dan jumlah game untuk setiap map yang dimainkan."}</p>
    </CardHeader>
    <CardContent className="space-y-6 p-5 sm:p-6" role="img" aria-label={summary || (isEn ? "No map results yet." : "Belum ada hasil map.")}>
      {!data.length ? <p className="py-8 text-center text-sm text-[#CBD5E1]">{isEn ? "No map results yet." : "Belum ada hasil map yang tercatat."}</p> : data.map((item) => {
        const percentage = item.winRate % 1 === 0 ? item.winRate.toFixed(0) : item.winRate.toFixed(1);
        return <div key={item.map} className="grid grid-cols-[72px_minmax(0,1fr)_76px] items-center gap-3 sm:grid-cols-[100px_minmax(0,1fr)_88px] sm:gap-4">
          <span className="text-[13px] font-medium text-[#F1F5F9]">{item.map}</span>
          <div className="h-3 overflow-hidden rounded-full bg-[#1C2433]" aria-hidden="true"><div className="h-full rounded-full bg-[#FF4655] transition-[width] duration-300" style={{ width: `${Math.max(0, Math.min(100, item.winRate))}%` }} /></div>
          <span className="text-right"><span className="block font-mono text-base font-bold tabular-nums text-white">{percentage}%</span><span className="block text-[11px] text-[#CBD5E1]">({item.total} {isEn ? (item.total === 1 ? "game" : "games") : "game"})</span></span>
        </div>;
      })}
    </CardContent>
  </Card>;
}
