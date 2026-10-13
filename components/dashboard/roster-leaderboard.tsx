"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { RosterDashboardRow } from "@/lib/utils/dashboard-aggregates";
import { getRosterStatusLabel } from "@/lib/utils/roster-behavior";
import { SMALL_SAMPLE_THRESHOLD } from "@/lib/utils/ui-constants";

interface RosterLeaderboardProps {
  leaderboard: RosterDashboardRow[];
  totalMatches: number;
}

export function RosterLeaderboard({
  leaderboard,
  totalMatches,
}: RosterLeaderboardProps) {
  const { t, language } = useTranslation();
  const isEn = language === "en";

  // If every row is below the sample threshold, surface one global note instead
  // of repeating a badge on each row.
  const allSmallSample =
    leaderboard.length > 0 &&
    leaderboard.every((row) => row.matches < SMALL_SAMPLE_THRESHOLD);

  return (
    <Card className="overflow-hidden border-[#1C2433] bg-[#0C1017]">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-[#1C2433] bg-[#090C10]">
        <div>
          <CardTitle className="text-sm sm:text-base">
            {t.dashboard.leaderboardTitle}
          </CardTitle>
          <p className="mt-1 text-xs leading-relaxed text-[#CBD5E1]">
            {t.dashboard.leaderboardSubtitle}
          </p>
          {allSmallSample && (
            <p className="mt-1 text-[11px] text-[#64748B]">
              {isEn
                ? `All players so far have fewer than ${SMALL_SAMPLE_THRESHOLD} scrims — treat rankings as provisional.`
                : `Semua pemain baru memainkan kurang dari ${SMALL_SAMPLE_THRESHOLD} scrim — peringkat masih sementara.`}
            </p>
          )}
        </div>
        <Link href="/roster">
          <Button
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-1.5 px-2.5 text-xs"
          >
            {isEn ? "Manage roster" : "Kelola roster"}
            <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {!leaderboard.length ? (
          <p className="p-6 text-center text-sm text-[#CBD5E1]">
            {isEn
              ? "No player performance data available."
              : "Belum ada data pemain."}
          </p>
        ) : (
          <table className="w-full table-fixed border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#1C2433] bg-[#090C10] text-xs font-semibold text-[#94A3B8]">
                <th className="w-10 px-3 py-3 text-center">#</th>
                <th className="px-3 py-3">{t.dashboard.player}</th>
                <th className="hidden w-[120px] px-3 py-3 sm:table-cell">
                  {t.dashboard.role}
                </th>
                <th className="w-[80px] px-3 py-3 text-center">
                  {t.dashboard.scrims}
                </th>
                <th className="w-[80px] px-3 py-3 text-center">K/D</th>
                <th className="w-[130px] px-3 py-3 text-center">
                  {isEn ? "Avg K / D / A" : "Rata K / D / A"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C2433]">
              {leaderboard.map((item, index) => (
                <LeaderboardRow
                  key={item.player.id}
                  item={item}
                  index={index}
                  totalMatches={totalMatches}
                  isEn={isEn}
                />
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

interface LeaderboardRowProps {
  item: RosterDashboardRow;
  index: number;
  totalMatches: number;
  isEn: boolean;
}

function LeaderboardRow({
  item,
  index,
  totalMatches,
  isEn,
}: LeaderboardRowProps) {
  const player = item.player;
  return (
    <tr className="transition-colors hover:bg-[#141A24]">
      <td className="px-3 py-3 text-center text-[#94A3B8]">{index + 1}</td>

      <td className="px-3 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href={`/players/${player.id}`}
            className="[overflow-wrap:anywhere] font-semibold text-white hover:text-[#FF7A84]"
          >
            {player.name}
          </Link>
          {!player.isActive && (
            <span className="rounded border border-[#2A364F] px-1.5 py-0.5 text-[10px] text-[#CBD5E1]">
              {getRosterStatusLabel(false, isEn ? "en" : "id")}
            </span>
          )}
        </div>
      </td>

      <td className="hidden px-3 py-3 text-[#CBD5E1] sm:table-cell">
        {player.primaryRole}
      </td>

      <td className="px-3 py-3 text-center tabular-nums text-white">
        {item.matches}
        {item.matches < totalMatches && (
          <span className="text-[#64748B]"> / {totalMatches}</span>
        )}
      </td>

      <td className="px-3 py-3 text-center font-tactical text-base font-bold tabular-nums text-white">
        {item.kdRatio.toFixed(2)}
      </td>

      <td className="px-3 py-3 text-center tabular-nums text-[#CBD5E1]">
        {item.avgKills.toFixed(1)}
        <span className="text-[#64748B]"> / </span>
        {item.avgDeaths.toFixed(1)}
        <span className="text-[#64748B]"> / </span>
        {item.avgAssists.toFixed(1)}
      </td>
    </tr>
  );
}
