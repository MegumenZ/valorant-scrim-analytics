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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C2433] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Riwayat Scrim
          </h1>
        </div>

        {isAdmin && (
          <Link href="/matches/new">
            <Button size="sm" className="gap-1.5 font-semibold shadow-sm">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Catat Scrim Baru</span>
            </Button>
          </Link>
        )}
      </div>

      {/* Interactive Match History Client */}
      <MatchHistoryClient initialMatches={matches} />
    </div>
  );
}
