"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardRecentMatch } from "@/lib/actions/matches";
import { useTranslation } from "@/lib/i18n/context";
import { calculateKD } from "@/lib/utils/calculations";

function matchKd(match: DashboardRecentMatch) {
  const totals = match.playerStats.reduce((result, row) => ({ kills: result.kills + row.kills, deaths: result.deaths + row.deaths }), { kills: 0, deaths: 0 });
  return calculateKD(totals.kills, totals.deaths);
}

function ResultBadge({ result, isEn }: { result: DashboardRecentMatch["result"]; isEn: boolean }) {
  const isWin = result === "WIN";
  const isLoss = result === "LOSS";
  const letter = isWin ? "W" : isLoss ? "L" : "D";
  const label = isWin ? (isEn ? "Win" : "Menang") : isLoss ? (isEn ? "Loss" : "Kalah") : (isEn ? "Draw" : "Seri");
  return <span title={label} aria-label={label} className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${isWin ? "bg-emerald-500/15 text-emerald-400" : isLoss ? "bg-[#FF4655]/10 text-[#FF4655]" : "bg-amber-500/15 text-amber-300"}`}>{letter}</span>;
}

export function RecentMatchesTable({ matches }: { matches: DashboardRecentMatch[] }) {
  const { language } = useTranslation();
  const isEn = language === "en";
  const headers = isEn ? ["Date", "Opponent", "Map", "Round Score", "Result", "K/D"] : ["Tanggal", "Lawan", "Map", "Skor Ronde", "Hasil", "K/D"];
  const scrimHref = (match: DashboardRecentMatch) => `/matches/${match.id}`;
  const linkClass = "block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4655]";

  return <Card className="overflow-hidden rounded-xl border-[#1C2433] bg-[#0C1017] text-[#F1F5F9] shadow-none">
    <CardContent className="p-0">
      {!matches.length ? <p className="py-10 text-center text-sm text-[#CBD5E1]">{isEn ? "No scrims in this period." : "Belum ada scrim pada periode ini."}</p> : <>
        <ul className="divide-y divide-[#1C2433] md:hidden">{matches.map((match) => <li key={match.id}><Link href={scrimHref(match)} className="block space-y-3 px-4 py-4 transition-colors hover:bg-[#141A24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF4655]">
          <div className="flex items-center justify-between gap-3"><span className="text-xs text-[#CBD5E1]">{match.matchDate}</span><ResultBadge result={match.result} isEn={isEn} /></div>
          <div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold text-white">{match.opponentName}</p><p className="mt-1 text-xs text-[#CBD5E1]">{match.map}</p></div><div className="text-right"><p className="font-mono text-sm font-semibold tabular-nums text-white">{match.scoreTeam} – {match.scoreOpponent}</p><p className="mt-1 text-xs text-[#CBD5E1]">K/D <span className="font-mono tabular-nums text-[#F1F5F9]">{matchKd(match).toFixed(2)}</span></p></div></div>
        </Link></li>)}</ul>
        <div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead><tr className="border-b border-[#1C2433] bg-[#090C10] text-xs font-semibold text-[#CBD5E1]">{headers.map((header, index) => <th key={header} className={`px-5 py-4 ${index >= 3 ? "text-center" : ""}`}>{header}</th>)}</tr></thead><tbody className="divide-y divide-[#1C2433]">{matches.map((match) => <tr key={match.id} className="cursor-pointer transition-colors hover:bg-[#141A24]">{[match.matchDate, match.opponentName, match.map].map((value, index) => <td key={headers[index]} className="px-5 py-4"><Link href={scrimHref(match)} className={`${linkClass} ${index === 1 ? "font-medium text-white" : "text-[#CBD5E1]"}`}>{value}</Link></td>)}<td className="px-5 py-4 text-center"><Link href={scrimHref(match)} className={`${linkClass} font-mono font-semibold tabular-nums text-white`}>{match.scoreTeam} – {match.scoreOpponent}</Link></td><td className="px-5 py-3 text-center"><Link href={scrimHref(match)} className={`mx-auto w-fit ${linkClass}`}><ResultBadge result={match.result} isEn={isEn} /></Link></td><td className="px-5 py-4 text-center"><Link href={scrimHref(match)} className={`${linkClass} font-mono font-semibold tabular-nums text-white`}>{matchKd(match).toFixed(2)}</Link></td></tr>)}</tbody></table></div>
      </>}
    </CardContent>
  </Card>;
}
