import React from "react";
import Link from "next/link";
import { Swords, PlusCircle } from "lucide-react";
import { getAllMatches } from "@/lib/actions/matches";
import { MatchHistoryClient } from "@/components/matches/match-history-client";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const [matches, user] = await Promise.all([
    getAllMatches(),
    getCurrentUser(),
  ]);

  const isAdmin = user ? (user.role === "ADMIN" || user.role === "COACH") : false;

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242e40] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <Swords className="w-6 h-6 text-rose-500" />
            <span>Riwayat Scrimmage Tim</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Arsip lengkap pertandingan tanding, filter map & hasil, serta ekspor spreadsheet.
          </p>
        </div>

        {isAdmin && (
          <Link href="/matches/new">
            <Button size="sm" className="gap-1.5 font-bold shadow-md shadow-rose-950/60">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Catat Scrim Baru</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Interactive Match History Client */}
      <MatchHistoryClient initialMatches={matches} />
    </div>
  );
}
