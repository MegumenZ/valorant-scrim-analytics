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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
      <Card className="h-full bg-[#0C1017] border-[#1C2433]">
        <CardHeader className="py-3.5 px-5 border-b border-[#1C2433] bg-[#090C10]">
          <div className="font-mono text-[10px] font-bold tracking-widest text-[#94A3B8] uppercase">
            // COMBAT INTENSITY TREND
          </div>
          <CardTitle className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5">
            Tren Combat Score Tim
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center font-mono text-[#64748B] text-xs">
          // NO_TREND_DATA: Belum ada riwayat pertandingan tercatat.
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d, index) => ({
    ...d,
    matchLabel: `M${index + 1} (${d.map})`,
  }));

  return (
    <Card className="h-full flex flex-col bg-[#0C1017] border-[#1C2433] overflow-hidden shadow-sm">
      <CardHeader className="py-3.5 px-5 border-b border-[#1C2433] bg-[#090C10]">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] font-bold tracking-widest text-[#94A3B8] uppercase">
              // COMBAT INTENSITY TREND
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5">
              Tren Combat Score Tim
            </CardTitle>
          </div>
          <div className="font-mono text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30 font-bold uppercase tracking-wider">
            BENCHMARK: 200+ ACS
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
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2433" vertical={false} />
              <XAxis
                dataKey="matchLabel"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#1C2433" }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#1C2433" }}
                domain={[100, 300]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as AcsTrendItem & { matchLabel: string };
                    return (
                      <div className="bg-[#090C10] border border-[#1C2433] p-3 rounded-lg shadow-xl text-xs space-y-1 font-mono">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-tactical font-black text-white text-base uppercase">
                            VS {item.opponent}
                          </p>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                              item.result === "WIN"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : item.result === "LOSS"
                                ? "bg-[#FF4655]/10 text-[#FF4655] border-[#FF4655]/40"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {item.result} ({item.score})
                          </span>
                        </div>
                        <p className="text-sky-400 font-bold text-sm">
                          {item.teamAvgAcs} ACS RATA-RATA
                        </p>
                        <p className="text-[#94A3B8] text-[10px]">
                          MAP: {item.map} // TANGGAL: {item.matchDate}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="teamAvgAcs"
                stroke="#0EA5E9"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#0C1017", stroke: "#0EA5E9", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#0EA5E9", stroke: "#FFFFFF", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
