import React from "react";
import { getDashboardSummary } from "@/lib/actions/matches";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { LiveRefresh } from "@/components/layout/live-refresh";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const params = await searchParams;
  const period = params.period === "7d" || params.period === "30d" ? params.period : "all";
  const { summary, recentMatches, leaderboard } = await getDashboardSummary(period);
  const renderedAt = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium" }).format(new Date());
  const refreshedAt = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).format(new Date());

  return (
    <div>
      <LiveRefresh renderedAt={refreshedAt} />
      <DashboardView
        summary={summary}
        recentMatches={recentMatches}
        leaderboard={leaderboard}
        period={period}
        dataDate={renderedAt}
      />
    </div>
  );
}
