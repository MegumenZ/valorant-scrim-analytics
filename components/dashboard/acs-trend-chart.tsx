"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

interface AcsTrendItem {
  matchId: string;
  matchDate: string;
  map: string;
  opponent: string;
  result: string;
  score: string;
  teamAvgAcs: number;
}

interface AcsTrendChartProps {
  data: AcsTrendItem[];
}

export function AcsTrendChart({ data }: AcsTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Tren Combat Score Tim</CardTitle>
          <CardDescription>Histori ACS tim antar pertandingan</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-slate-500 text-xs">
          Belum ada riwayat pertandingan tercatat
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d, index) => ({
    ...d,
    matchLabel: `M${index + 1} (${d.map})`,
  }));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tren Combat Score Tim</CardTitle>
            <CardDescription>Rata-rata ACS tim sepanjang match terakhir</CardDescription>
          </div>
          <div className="text-xs text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/30 font-semibold">
            Target: 200+ ACS
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 flex-1">
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -25, bottom: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#242e40" vertical={false} />
              <XAxis
                dataKey="matchLabel"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#242e40" }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#242e40" }}
                domain={[100, 300]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as AcsTrendItem & { matchLabel: string };
                    return (
                      <div className="bg-[#141a24] border border-[#242e40] p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-bold text-slate-100">
                            vs {item.opponent}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.result === "WIN"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : item.result === "LOSS"
                                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {item.result} ({item.score})
                          </span>
                        </div>
                        <p className="text-slate-300">
                          Map: <strong className="text-white">{item.map}</strong>
                        </p>
                        <p className="text-sky-400 font-semibold">
                          Avg Combat Score: {item.teamAvgAcs} ACS
                        </p>
                        <p className="text-slate-400 text-[11px]">{item.matchDate}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="teamAvgAcs"
                stroke="#38BDF8"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#38BDF8", stroke: "#0b0e14", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#FF4655", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
