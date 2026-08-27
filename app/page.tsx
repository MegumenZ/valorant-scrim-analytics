import React from "react";
import { getDashboardSummary } from "@/lib/actions/matches";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { summary, recentMatches, allMatches, leaderboard } = await getDashboardSummary();

  return (
    <DashboardView
      summary={summary}
      recentMatches={recentMatches}
      allMatches={allMatches}
      leaderboard={leaderboard}
    />
  );
}
