"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/context";

export interface KdTrendPoint { matchId: string; matchDate: string; map: string; opponent: string; result: string; score: string; teamKd: number }

export function KdTrendChart({ data }: { data: KdTrendPoint[] }) {
  const { language, t } = useTranslation();
  const isEn = language === "en";
  const resultLabel = (result: string) => result === "WIN" ? t.common.win : result === "LOSS" ? t.common.loss : t.common.draw;
  const description = isEn
    ? `Team K/D for ${data.length} scrims, ordered by date. ${data.map((item) => `${item.matchDate}, ${item.map} against ${item.opponent}, K/D ${item.teamKd.toFixed(2)}`).join(". ")}`
    : `K/D tim dari ${data.length} scrim, diurutkan berdasarkan tanggal. ${data.map((item) => `${item.matchDate}, ${item.map} melawan ${item.opponent}, K/D ${item.teamKd.toFixed(2)}`).join(". ")}`;

  return <Card className="flex h-full flex-col border-[#1C2433] bg-[#0C1017]">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-semibold text-white sm:text-base">{t.dashboard.kdTrendTitle}</CardTitle>
      <p className="text-xs text-[#CBD5E1]">{isEn ? `${data.length} scrims · chronological` : `${data.length} scrim · urut tanggal`}</p>
      <p className="text-xs leading-relaxed text-[#CBD5E1]">{t.dashboard.kdTrendHint}</p>
    </CardHeader>
    <p id="kd-trend-description" className="sr-only">{description || (isEn ? "No scrim data." : "Belum ada data scrim.")}</p>
    <CardContent className="flex-1 p-3 sm:p-5">
      {!data.length ? <div className="grid min-h-60 place-items-center text-xs text-[#CBD5E1]">{isEn ? "No match data yet" : "Belum ada data pertandingan"}</div>
        : data.length < 5 ? <div className="grid min-h-60 place-items-center px-4 text-center text-sm text-[#CBD5E1]">{isEn ? "At least 10 scrims are needed for a reliable trend." : "Butuh minimal 10 scrim untuk tren yang akurat"}</div>
          : <div className="h-60 w-full" role="img" aria-describedby="kd-trend-description"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 24, right: 12, left: -20, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1C2433" />
            <XAxis dataKey="matchDate" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={{ stroke: "#1C2433" }} tickMargin={8} minTickGap={20} />
            <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickMargin={8} domain={[0, "auto"]} />
            <Tooltip cursor={{ fill: "#1C2433", opacity: 0.55 }} content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0].payload as KdTrendPoint;
              return <div className="space-y-1 rounded-lg border border-[#2A364F] bg-[#090C10] p-3 text-xs shadow-xl"><p className="font-semibold text-white">{item.map} · {item.matchDate}</p><p className="text-[#CBD5E1]">{isEn ? "Opponent" : "Lawan"}: {item.opponent}</p><p className="text-[#CBD5E1]">{isEn ? "Score" : "Skor"}: {item.score} · <span className={item.result === "WIN" ? "text-emerald-400" : item.result === "LOSS" ? "text-[#FF4655]" : "text-amber-400"}>{resultLabel(item.result)}</span></p><p className="font-tactical font-bold text-sky-300">K/D: {item.teamKd.toFixed(2)}</p></div>;
            }} />
            <Bar dataKey="teamKd" name={t.dashboard.teamKd} fill="#FF4655" radius={[4, 4, 0, 0]} maxBarSize={48}>
              <LabelList dataKey="teamKd" position="top" formatter={(value) => Number(value).toFixed(2)} fill="#F8FAFC" fontSize={11} fontWeight={700} />
            </Bar>
          </BarChart></ResponsiveContainer></div>}
    </CardContent>
  </Card>;
}
