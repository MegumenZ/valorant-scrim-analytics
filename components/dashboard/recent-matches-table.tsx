"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardRecentMatch } from "@/lib/actions/matches";
import { calculateKD } from "@/lib/utils/calculations";
import { useTranslation } from "@/lib/i18n/context";

const RESULT_STYLE: Record<
  DashboardRecentMatch["result"],
  { letter: string; className: string; labelId: string; labelEn: string }
> = {
  WIN: {
    letter: "W",
    className: "bg-emerald-500/15 text-emerald-400",
    labelId: "Menang",
    labelEn: "Win",
  },
  LOSS: {
    letter: "L",
    className: "bg-[#FF4655]/10 text-[#FF4655]",
    labelId: "Kalah",
    labelEn: "Loss",
  },
  DRAW: {
    letter: "D",
    className: "bg-amber-500/15 text-amber-300",
    labelId: "Seri",
    labelEn: "Draw",
  },
};

const MONTHS_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
const MONTHS_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Format ISO date ("2026-08-15") to a compact label without timezone surprises. */
function formatMatchDate(iso: string, isEn: boolean): string {
  const [year, month, day] = iso.split("-");
  const months = isEn ? MONTHS_EN : MONTHS_ID;
  const label = months[Number(month) - 1] ?? month;
  return `${Number(day)} ${label} ${year}`;
}

function matchKd(match: DashboardRecentMatch): string {
  const totals = match.playerStats.reduce(
    (acc, row) => ({
      kills: acc.kills + row.kills,
      deaths: acc.deaths + row.deaths,
    }),
    { kills: 0, deaths: 0 },
  );
  return calculateKD(totals.kills, totals.deaths).toFixed(2);
}

export function RecentMatchesTable({
  matches,
}: {
  matches: DashboardRecentMatch[];
}) {
  const { language } = useTranslation();
  const isEn = language === "en";
  const headers = isEn
    ? ["Date", "Opponent", "Map", "Round Score", "Result", "K/D"]
    : ["Tanggal", "Lawan", "Map", "Skor Ronde", "Hasil", "K/D"];

  if (!matches.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-[#CBD5E1]">
          {isEn
            ? "No scrims in this period."
            : "Belum ada scrim pada periode ini."}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Mobile: stacked cards */}
        <ul className="divide-y divide-[#1C2433] md:hidden">
          {matches.map((match) => (
            <li key={match.id}>
              <MatchCard match={match} isEn={isEn} />
            </li>
          ))}
        </ul>

        {/* Desktop: compact table */}
        <table className="hidden w-full text-left text-sm md:table">
          <thead>
            <tr className="border-b border-[#1C2433] bg-[#090C10] text-xs font-semibold text-[#94A3B8]">
              {headers.map((header, index) => (
                <th
                  key={header}
                  className={`whitespace-nowrap px-5 py-3 ${index >= 3 ? "text-center" : ""}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C2433]">
            {matches.map((match) => (
              <MatchRow key={match.id} match={match} isEn={isEn} />
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

/* ---------- Row renderers ---------- */

function MatchCard({
  match,
  isEn,
}: {
  match: DashboardRecentMatch;
  isEn: boolean;
}) {
  const result = RESULT_STYLE[match.result];
  const label = isEn ? result.labelEn : result.labelId;
  return (
    <Link
      href={`/matches/${match.id}`}
      className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-[#141A24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4655]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-[#94A3B8]">
          {formatMatchDate(match.matchDate, isEn)}
        </span>
        <span
          title={label}
          aria-label={label}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${result.className}`}
        >
          {result.letter}
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">
            {match.opponentName}
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">{match.map}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-semibold tabular-nums text-white">
            {match.scoreTeam} – {match.scoreOpponent}
          </p>
          <p className="mt-1 text-xs text-[#94A3B8]">
            K/D{" "}
            <span className="font-mono tabular-nums text-[#F1F5F9]">
              {matchKd(match)}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}

function MatchRow({
  match,
  isEn,
}: {
  match: DashboardRecentMatch;
  isEn: boolean;
}) {
  const result = RESULT_STYLE[match.result];
  const label = isEn ? result.labelEn : result.labelId;
  const href = `/matches/${match.id}`;
  return (
    <tr className="group transition-colors hover:bg-[#141A24]">
      <td className="whitespace-nowrap px-5 py-4">
        <Link href={href} className="block text-[#94A3B8]">
          {formatMatchDate(match.matchDate, isEn)}
        </Link>
      </td>
      <td className="px-5 py-4">
        <Link href={href} className="block font-medium text-white">
          {match.opponentName}
        </Link>
      </td>
      <td className="px-5 py-4">
        <Link href={href} className="block text-[#CBD5E1]">
          {match.map}
        </Link>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-center">
        <Link
          href={href}
          className="block font-mono font-semibold tabular-nums text-white"
        >
          {match.scoreTeam} – {match.scoreOpponent}
        </Link>
      </td>
      <td className="px-5 py-3 text-center">
        <Link
          href={href}
          title={label}
          aria-label={label}
          className={`mx-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${result.className}`}
        >
          {result.letter}
        </Link>
      </td>
      <td className="whitespace-nowrap px-5 py-4 text-center">
        <Link
          href={href}
          className="block font-mono font-semibold tabular-nums text-white"
        >
          {matchKd(match)}
        </Link>
      </td>
    </tr>
  );
}
