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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
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
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Win Rate Berdasarkan Map</CardTitle>
          <CardDescription>Belum ada data pertandingan yang tercatat.</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-slate-500 text-xs">
          Belum ada data map tersedia
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Win Rate Berdasarkan Map</CardTitle>
            <CardDescription>Persentase kemenangan tim pada setiap map</CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>&ge; 50% Win</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>&lt; 50% Win</span>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#242e40" vertical={false} />
              <XAxis
                dataKey="map"
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
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                cursor={{ fill: "rgba(36, 46, 64, 0.4)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as MapChartItem;
                    return (
                      <div className="bg-[#141a24] border border-[#242e40] p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-bold text-slate-100 text-sm">
                          {item.map}
                        </p>
                        <p className="text-emerald-400 font-semibold">
                          Win Rate: {item.winRate}%
                        </p>
                        <p className="text-slate-300">
                          Rekor: {item.wins} Menang - {item.losses} Kalah {item.draws > 0 ? `- ${item.draws} Seri` : ""}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Total Match: {item.total} Game
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="winRate" radius={[6, 6, 0, 0]} maxBarSize={44}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.winRate >= 50 ? "#10B981" : "#EF4444"}
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
