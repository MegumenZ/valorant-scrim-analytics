"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ValorantMap } from "@/lib/data/valorant";

interface MapChartItem {
  map: ValorantMap;
  total: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

interface MapWinrateChartProps {
  data: MapChartItem[];
}

export function MapWinrateChart({ data }: MapWinrateChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="h-full bg-[#0C1017] border-[#1C2433]">
        <CardHeader className="py-3.5 px-5 border-b border-[#1C2433] bg-[#090C10]">
          <div className="font-mono text-[10px] font-bold tracking-widest text-[#94A3B8] uppercase">
            // MAP PERFORMANCE MATRIX
          </div>
          <CardTitle className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5">
            Win Rate Berdasarkan Map
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center font-mono text-[#64748B] text-xs">
          // NO_MAP_DATA: Belum ada data map tercatat.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-[#0C1017] border-[#1C2433] overflow-hidden shadow-sm">
      <CardHeader className="py-3.5 px-5 border-b border-[#1C2433] bg-[#090C10]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="font-mono text-[10px] font-bold tracking-widest text-[#94A3B8] uppercase">
              // MAP PERFORMANCE MATRIX
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5">
              Win Rate Berdasarkan Map
            </CardTitle>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>&ge; 50% WIN</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF4655]" />
              <span>&lt; 50% WIN</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 flex-1">
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -25, bottom: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1C2433" vertical={false} />
              <XAxis
                dataKey="map"
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
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                cursor={{ fill: "rgba(28, 36, 51, 0.4)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as MapChartItem;
                    return (
                      <div className="bg-[#090C10] border border-[#1C2433] p-3 rounded-lg shadow-xl text-xs space-y-1 font-mono">
                        <p className="font-tactical font-black text-white text-base uppercase">
                          MAP // {item.map}
                        </p>
                        <p className={item.winRate >= 50 ? "text-emerald-400 font-bold" : "text-[#FF4655] font-bold"}>
                          WIN RATE: {item.winRate}%
                        </p>
                        <p className="text-[#94A3B8] text-[11px]">
                          RECORD: {item.wins}W - {item.losses}L {item.draws > 0 ? `(${item.draws}D)` : ""} [{item.total} GAME]
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.winRate >= 50 ? "#10B981" : "#FF4655"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
