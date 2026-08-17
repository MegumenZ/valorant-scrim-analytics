import React from "react";
import { notFound } from "next/navigation";
import { getMatchById } from "@/lib/actions/matches";
import { getAllPlayers } from "@/lib/actions/players";
import { MatchEntryForm } from "@/components/matches/match-entry-form";
import { ValorantMap } from "@/lib/data/valorant";

export const dynamic = "force-dynamic";

interface EditMatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMatchPage({ params }: EditMatchPageProps) {
  const { id } = await params;
  const match = await getMatchById(id);
  const players = await getAllPlayers();

  if (!match) {
    notFound();
  }

  const initialData = {
    id: match.id,
    matchDate: match.matchDate,
    map: match.map as ValorantMap,
    opponentName: match.opponentName,
    scoreTeam: match.scoreTeam,
    scoreOpponent: match.scoreOpponent,
    startSide: match.startSide as "ATTACK" | "DEFENSE",
    vodUrl: match.vodUrl,
    notes: match.notes,
    attachments: match.parsedAttachments || [],
    stats: match.playerStats.map((s) => ({
      playerId: s.playerId,
      agent: s.agent,
      acs: s.acs,
      kills: s.kills,
      deaths: s.deaths,
      assists: s.assists,
      adr: s.adr,
      hsPercent: s.hsPercent,
      firstKills: s.firstKills,
      firstDeaths: s.firstDeaths,
      clutchesWon: s.clutchesWon,
    })),
  };

  return (
    <div className="py-2">
      <MatchEntryForm availablePlayers={players} initialData={initialData} />
    </div>
  );
}
