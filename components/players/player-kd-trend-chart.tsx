"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/context";
import { SMALL_SAMPLE_THRESHOLD } from "@/lib/utils/ui-constants";

export interface PlayerKdTrendPoint {
  matchId: string;
  matchDate: string;
  map: string;
  opponentName: string;
  result: string;
  scoreTeam: number;
  scoreOpponent: number;
  kdRatio: number;
}

interface PlayerKdTrendChartProps {
  data: PlayerKdTrendPoint[];
  playerName: string;
}

export function PlayerKdTrendChart({
  data,
  playerName,
}: PlayerKdTrendChartProps) {
  const { language } = useTranslation();
  const isEn = language === "en";

  // Recharts treats the X axis as categorical: two scrims sharing a matchDate
  // collapse into one tick and hide a data point. Key the axis on matchId and
  // format the tick back to a date.
  const chartData = data.map((point) => ({
    ...point,
    xKey: `${point.matchDate}#${point.matchId}`,
  }));

  const title = isEn
    ? `${playerName} — K/D per scrim`
    : `Tren K/D ${playerName} per scrim`;
  const hint = isEn
    ? "One point = one scrim · K/D above 1 means this player got more kills than deaths in that match"
    : "Satu titik = satu scrim · K/D di atas 1 berarti kill pemain ini lebih banyak daripada death di pertandingan itu";
  const kdLabel = isEn ? `${playerName} K/D` : `K/D ${playerName}`;

  return (
    <Card className="bg-[#0C1017] border-[#1C2433]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-white">
          {title}
        </CardTitle>
        <p className="flex flex-wrap items-center gap-2 text-xs text-[#CBD5E1]">
          {isEn
            ? `${data.length} scrims · chronological`
            : `${data.length} scrim · urut tanggal`}
          {data.length < SMALL_SAMPLE_THRESHOLD && (
            <span className="rounded border border-[#2A364F] bg-[#141A24] px-1.5 py-0.5">
              {isEn ? "Small sample" : "Sampel kecil"} (n={data.length})
            </span>
          )}
        </p>
        <p className="text-xs leading-relaxed text-[#CBD5E1]">{hint}</p>
        <p className="sr-only">
          {isEn
            ? `Line chart of ${playerName}'s individual K/D across ${data.length} scrims.`
            : `Grafik garis K/D individu ${playerName} dari ${data.length} scrim.`}
        </p>
      </CardHeader>
      <CardContent className="p-3 sm:p-5">
        {data.length ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 12, left: -20, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2433" />
                <XAxis
                  dataKey="xKey"
                  tickFormatter={(value: string) => value.split("#")[0]}
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#1C2433" }}
                  minTickGap={20}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, "auto"]}
                />
                {/* Break-even reference: K/D = 1 */}
                <ReferenceLine y={1} stroke="#475569" strokeDasharray="4 4" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload as PlayerKdTrendPoint & {
                      xKey: string;
                    };
                    return (
                      <div className="rounded border border-[#2A364F] bg-[#090C10] p-3 text-xs">
                        <strong className="text-white">
                          {row.map} · {row.matchDate}
                        </strong>
                        <div className="text-[#CBD5E1]">
                          vs {row.opponentName} · {row.scoreTeam}-
                          {row.scoreOpponent}
                        </div>
                        <div className="text-sky-300">
                          {kdLabel} {row.kdRatio.toFixed(2)} · {row.result}
                        </div>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="kdRatio"
                  name={kdLabel}
                  stroke="#FF4655"
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                    fill: "#FF4655",
                    stroke: "#0C1017",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-56 grid place-items-center text-sm text-[#CBD5E1]">
            {isEn ? "No match data yet." : "Belum ada data pertandingan."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
