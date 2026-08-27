import React from "react";
import { notFound } from "next/navigation";
import { getPlayerProfile } from "@/lib/actions/players";
import { PlayerProfileView } from "@/components/players/player-profile-view";

export const dynamic = "force-dynamic";

interface PlayerProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { id } = await params;
  const data = await getPlayerProfile(id);

  if (!data) {
    notFound();
  }

  const { player, stats, agentPool, recentMatches } = data;

  return (
    <PlayerProfileView
      player={player}
      stats={stats}
      agentPool={agentPool}
      recentMatches={recentMatches}
    />
  );
}
